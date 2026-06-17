import React, { useMemo, useState } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { BATCH_STATUS_MAP, SterilePack } from '@/types/instrument';
import StatusTag from '@/components/StatusTag';
import { formatTime, generateBatchNo } from '@/utils/format';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const BatchDetailPage: React.FC = () => {
  const {
    batches,
    orders,
    user,
    updateBatch,
    updateOrder,
    addBatch,
    addSterilePack
  } = useAppStore();
  const [remark, setRemark] = useState('');
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  const params = Taro.getCurrentInstance().router?.params;
  const batchId = params?.id || '';

  const batch = useMemo(() => batches.find((b) => b.id === batchId), [batches, batchId]);

  if (!batch) {
    return (
      <View className={styles.container}>
        <View className={styles.section}>
          <Text>批次不存在</Text>
        </View>
      </View>
    );
  }

  const relatedOrders = orders.filter((o) => batch.orderNos.includes(o.orderNo));

  const steps = [
    {
      key: 'received',
      label: '入库',
      time: batch.washStartedAt ? dayjs(batch.washStartedAt).subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss') : null,
      done: true
    },
    {
      key: 'split',
      label: '拆包/合包',
      time: batch.isSplit || batch.isMerged ? batch.washStartedAt : null,
      done: batch.isSplit || batch.isMerged || batch.status !== 'received'
    },
    {
      key: 'washing',
      label: '清洗',
      time: batch.washCompletedAt || null,
      done: !!batch.washCompletedAt
    },
    {
      key: 'sterilizing',
      label: '灭菌',
      time: batch.sterilizeCompletedAt || null,
      done: !!batch.sterilizeCompletedAt
    },
    {
      key: 'completed',
      label: '完成',
      time: batch.completedAt || null,
      done: batch.status === 'completed'
    }
  ];

  const currentStep = batch.status === 'returned' ? -1 : steps.findIndex((s) => !s.done);

  const canSplit = batch.status === 'received' && !batch.isSplit;
  const canMerge = batch.status === 'received';
  const canStartWash = batch.status === 'received' && !batch.washStartedAt;
  const canCompleteWash = batch.status === 'washing';
  const canStartSterilize = batch.status === 'washing' && batch.washCompletedAt && !batch.sterilizeStartedAt;
  const canCompleteSterilize = batch.status === 'sterilizing';
  const canComplete = batch.status === 'sterilizing' && batch.sterilizeCompletedAt;
  const canReturn = batch.status !== 'completed' && batch.status !== 'returned';

  const handleSplit = () => {
    if (batch.instrumentCount < splitCount * 2) {
      Taro.showToast({ title: '器械数量不足拆分', icon: 'none' });
      return;
    }

    const qtyPerBatch = Math.floor(batch.instrumentCount / splitCount);
    const remainder = batch.instrumentCount % splitCount;

    Taro.showModal({
      title: '确认拆包',
      content: `将本批次拆分为 ${splitCount} 个子批次，每批约 ${qtyPerBatch} 件器械`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

          updateBatch(batch.id, {
            isSplit: true
          });

          for (let i = 0; i < splitCount; i++) {
            const subBatchQty = i === 0 ? qtyPerBatch + remainder : qtyPerBatch;
            const subBatch = {
              id: `b_${Date.now()}_${i}`,
              batchNo: generateBatchNo(),
              orderNos: batch.orderNos,
              instrumentCount: subBatchQty,
              status: 'received' as const,
              operatorName: user.name,
              isSplit: false,
              isMerged: false,
              parentBatchNo: batch.batchNo
            };
            addBatch(subBatch);
            console.info('[BatchDetail] Sub-batch created:', subBatch.batchNo, 'qty:', subBatchQty);
          }

          console.info('[BatchDetail] Batch split:', batch.batchNo, 'into', splitCount, 'sub-batches');
          Taro.showToast({ title: '拆包成功', icon: 'success' });
          setShowSplitDialog(false);
        }
      }
    });
  };

  const handleMerge = () => {
    const availableBatches = batches.filter(
      (b) =>
        b.status === 'received' &&
        b.id !== batch.id &&
        !b.isSplit &&
        b.operatorName === batch.operatorName
    );

    if (availableBatches.length === 0) {
      Taro.showToast({ title: '暂无可合包的批次', icon: 'none' });
      return;
    }

    Taro.showActionSheet({
      itemList: availableBatches.map(
        (b) => `${b.batchNo}（${b.instrumentCount}件）`
      ),
      success: (res) => {
        const targetBatch = availableBatches[res.tapIndex];
        Taro.showModal({
          title: '确认合包',
          content: `将本批次（${batch.instrumentCount}件）与 ${targetBatch.batchNo}（${targetBatch.instrumentCount}件）合并？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
              const totalQty = batch.instrumentCount + targetBatch.instrumentCount;
              const newBatchNo = generateBatchNo();

              const mergedBatch = {
                id: `b_${Date.now()}`,
                batchNo: newBatchNo,
                orderNos: [...new Set([...batch.orderNos, ...targetBatch.orderNos])],
                instrumentCount: totalQty,
                status: 'received' as const,
                operatorName: user.name,
                isSplit: false,
                isMerged: true
              };
              addBatch(mergedBatch);

              updateBatch(batch.id, {
                status: 'completed',
                completedAt: now,
                isMerged: true,
                remark: `已合并至 ${newBatchNo}`
              });
              updateBatch(targetBatch.id, {
                status: 'completed',
                completedAt: now,
                isMerged: true,
                remark: `已合并至 ${newBatchNo}`
              });

              console.info(
                '[BatchDetail] Batches merged:',
                batch.batchNo,
                '+',
                targetBatch.batchNo,
                '→',
                newBatchNo
              );
              Taro.showToast({ title: '合包成功', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleStartWash = () => {
    Taro.showModal({
      title: '开始清洗',
      content: `确认开始清洗批次 ${batch.batchNo} 的 ${batch.instrumentCount} 件器械？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          updateBatch(batch.id, {
            status: 'washing',
            washStartedAt: now
          });
          batch.orderNos.forEach((orderNo) => {
            const order = orders.find((o) => o.orderNo === orderNo);
            if (order) {
              updateOrder(order.id, { status: 'washing' });
            }
          });
          console.info('[BatchDetail] Wash started:', batch.batchNo);
          Taro.showToast({ title: '已开始清洗', icon: 'success' });
        }
      }
    });
  };

  const handleCompleteWash = () => {
    Taro.showModal({
      title: '完成清洗',
      content: `确认批次 ${batch.batchNo} 清洗完成？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          updateBatch(batch.id, {
            washCompletedAt: now,
            status: 'sterilizing',
            sterilizeStartedAt: now
          });
          batch.orderNos.forEach((orderNo) => {
            const order = orders.find((o) => o.orderNo === orderNo);
            if (order) {
              updateOrder(order.id, { status: 'sterilizing' });
            }
          });
          console.info('[BatchDetail] Wash completed:', batch.batchNo);
          Taro.showToast({ title: '清洗已完成', icon: 'success' });
        }
      }
    });
  };

  const handleCompleteSterilize = () => {
    Taro.showModal({
      title: '完成灭菌',
      content: `确认批次 ${batch.batchNo} 灭菌完成？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          updateBatch(batch.id, {
            status: 'completed',
            sterilizeCompletedAt: now,
            completedAt: now
          });
          batch.orderNos.forEach((orderNo) => {
            const order = orders.find((o) => o.orderNo === orderNo);
            if (order) {
              updateOrder(order.id, { status: 'completed' });
            }
          });

          const packQty = Math.ceil(batch.instrumentCount / 5);
          for (let i = 0; i < packQty; i++) {
            const pack: SterilePack = {
              id: `p_${Date.now()}_${i}`,
              packNo: `WP${dayjs().format('YYYYMMDD')}${String(i + 1).padStart(3, '0')}`,
              batchNo: batch.batchNo,
              instrumentName: `器械包${i + 1}`,
              sterilizeMethod: '高温高压',
              sterilizeDate: dayjs().format('YYYY-MM-DD'),
              expiryDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
              status: 'valid'
            };
            addSterilePack(pack);
          }

          console.info('[BatchDetail] Sterilize completed:', batch.batchNo, 'packs created:', packQty);
          Taro.showToast({ title: '灭菌已完成', icon: 'success' });
        }
      }
    });
  };

  const handleReturn = () => {
    Taro.showActionSheet({
      itemList: ['包装破损', '器械缺失', '清洗不合格', '其他异常'],
      success: (res) => {
        const reasons = ['包装破损', '器械缺失', '清洗不合格', '其他异常'];
        Taro.showModal({
          title: '异常退回',
          content: `确认将批次 ${batch.batchNo} 退回？原因：${reasons[res.tapIndex]}`,
          confirmText: '退回',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
              updateBatch(batch.id, {
                status: 'returned',
                remark: remark || reasons[res.tapIndex]
              });
              batch.orderNos.forEach((orderNo) => {
                const order = orders.find((o) => o.orderNo === orderNo);
                if (order) {
                  updateOrder(order.id, {
                    status: 'returned',
                    remark: remark || reasons[res.tapIndex]
                  });
                }
              });
              console.info('[BatchDetail] Batch returned:', batch.batchNo, 'reason:', reasons[res.tapIndex]);
              Taro.showToast({ title: '已退回', icon: 'success' });
            }
          }
        });
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.statusBanner}>
        <View>
          <Text className={styles.statusText}>{BATCH_STATUS_MAP[batch.status]}</Text>
        </View>
        <Text className={styles.batchNoText}>{batch.batchNo}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>批次信息</Text>
        <View className={styles.row}>
          <Text className={styles.label}>器械数量</Text>
          <Text className={styles.value}>
            <Text style={{ color: '#0EA5A0', fontWeight: 600, fontSize: 32 }}>
              {batch.instrumentCount}
            </Text>{' '}
            件
          </Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>操作员</Text>
          <Text className={styles.value}>{batch.operatorName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>关联订单</Text>
          <Text className={styles.value}>{batch.orderNos.join(', ')}</Text>
        </View>
        {batch.parentBatchNo && (
          <View className={styles.row}>
            <Text className={styles.label}>父批次</Text>
            <Text className={styles.value}>{batch.parentBatchNo}</Text>
          </View>
        )}
        {batch.isSplit && (
          <View className={styles.row}>
            <Text className={styles.label}>拆包状态</Text>
            <Text className={styles.value} style={{ color: '#3498DB', fontWeight: 500 }}>
              已拆分为子批次
            </Text>
          </View>
        )}
        {batch.isMerged && (
          <View className={styles.row}>
            <Text className={styles.label}>合包状态</Text>
            <Text className={styles.value} style={{ color: '#3498DB', fontWeight: 500 }}>
              已合包
            </Text>
          </View>
        )}
      </View>

      {relatedOrders.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>关联门诊</Text>
          {Array.from(new Set(relatedOrders.map((o) => o.clinicName))).map((clinic, idx) => (
            <View key={idx} className={styles.row}>
              <Text className={styles.label}>门诊</Text>
              <Text className={styles.value}>{clinic}</Text>
            </View>
          ))}
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>处理进度</Text>
        <View className={styles.progress}>
          {steps.map((step, index) => (
            <View key={step.key} className={styles.step}>
              <View className={styles.stepDotWrap}>
                <View
                  className={classnames(
                    index <= currentStep || step.done
                      ? styles.stepDotActive
                      : currentStep >= 0 && index === currentStep + 1
                        ? styles.stepDotCurrent
                        : styles.stepDot
                  )}
                />
                {index < steps.length - 1 && (
                  <View
                    className={
                      index < currentStep || step.done ? styles.stepLineActive : styles.stepLine
                    }
                  />
                )}
              </View>
              <Text
                className={
                  index <= currentStep || step.done ? styles.stepLabelActive : styles.stepLabel
                }
              >
                {step.label}
              </Text>
              {step.time && (
                <Text className={styles.stepTime}>{formatTime(step.time, 'HH:mm')}</Text>
              )}
            </View>
          ))}
        </View>

        {batch.washStartedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>清洗开始</Text>
            <Text className={styles.detailValue}>{formatTime(batch.washStartedAt)}</Text>
          </View>
        )}
        {batch.washCompletedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>清洗完成</Text>
            <Text className={styles.detailValue}>{formatTime(batch.washCompletedAt)}</Text>
          </View>
        )}
        {batch.sterilizeStartedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>灭菌开始</Text>
            <Text className={styles.detailValue}>{formatTime(batch.sterilizeStartedAt)}</Text>
          </View>
        )}
        {batch.sterilizeCompletedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>灭菌完成</Text>
            <Text className={styles.detailValue}>{formatTime(batch.sterilizeCompletedAt)}</Text>
          </View>
        )}
      </View>

      {batch.status !== 'returned' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>操作记录</Text>
          <View className={styles.remarkInputContainer}>
            <Textarea
              className={styles.remarkInput}
              placeholder="操作备注（可选）"
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
          </View>
        </View>
      )}

      {batch.remark && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>备注</Text>
          <View className={styles.remarkBox}>
            <Text className={styles.remarkText}>{batch.remark}</Text>
          </View>
        </View>
      )}

      {batch.status !== 'returned' && batch.status !== 'completed' && <View className={styles.placeholder} />}

      {batch.status !== 'returned' && batch.status !== 'completed' && (
        <View className={styles.actionBar}>
          <ScrollView className={styles.actionScroll} scrollX>
            <View className={styles.actionBtns}>
              {canSplit && (
                <View className={classnames(styles.actionBtn, styles.actionBtnSecondary)} onClick={() => setShowSplitDialog(true)}>
                  <Text className={styles.actionBtnText}>拆包</Text>
                </View>
              )}
              {canMerge && (
                <View className={classnames(styles.actionBtn, styles.actionBtnSecondary)} onClick={handleMerge}>
                  <Text className={styles.actionBtnText}>合包</Text>
                </View>
              )}
              {canStartWash && (
                <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={handleStartWash}>
                  <Text className={styles.actionBtnTextPrimary}>开始清洗</Text>
                </View>
              )}
              {canCompleteWash && (
                <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={handleCompleteWash}>
                  <Text className={styles.actionBtnTextPrimary}>清洗完成</Text>
                </View>
              )}
              {canCompleteSterilize && (
                <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={handleCompleteSterilize}>
                  <Text className={styles.actionBtnTextPrimary}>灭菌完成</Text>
                </View>
              )}
              {canReturn && (
                <View className={classnames(styles.actionBtn, styles.actionBtnDanger)} onClick={handleReturn}>
                  <Text className={styles.actionBtnTextDanger}>异常退回</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {showSplitDialog && (
        <View className={styles.dialogMask} onClick={() => setShowSplitDialog(false)}>
          <View className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.dialogTitle}>拆包设置</Text>
            <Text className={styles.dialogDesc}>请设置拆分为几个子批次</Text>
            <View className={styles.splitControl}>
              <View
                className={styles.splitBtn}
                onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
              >
                <Text className={styles.splitBtnText}>-</Text>
              </View>
              <Text className={styles.splitCount}>{splitCount}</Text>
              <View
                className={styles.splitBtn}
                onClick={() => setSplitCount(Math.min(5, splitCount + 1))}
              >
                <Text className={styles.splitBtnText}>+</Text>
              </View>
            </View>
            <View className={styles.dialogButtons}>
              <View className={styles.dialogBtn} onClick={() => setShowSplitDialog(false)}>
                <Text className={styles.dialogBtnText}>取消</Text>
              </View>
              <View className={classnames(styles.dialogBtn, styles.dialogBtnPrimary)} onClick={handleSplit}>
                <Text className={styles.dialogBtnTextPrimary}>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BatchDetailPage;
