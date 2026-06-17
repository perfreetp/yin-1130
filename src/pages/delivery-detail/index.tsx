import React, { useMemo, useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { DELIVERY_STATUS_MAP, ORDER_STATUS_MAP } from '@/types/instrument';
import StatusTag from '@/components/StatusTag';
import { formatTime } from '@/utils/format';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const DeliveryDetailPage: React.FC = () => {
  const {
    deliveries,
    orders,
    batches,
    user,
    currentRole,
    updateDelivery,
    updateOrder
  } = useAppStore();
  const [signedBy, setSignedBy] = useState('');
  const [recheckRemark, setRecheckRemark] = useState('');
  const [recheckQty, setRecheckQty] = useState('');
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showRecheckDialog, setShowRecheckDialog] = useState(false);

  const params = Taro.getCurrentInstance().router?.params;
  const deliveryId = params?.id || '';

  const delivery = useMemo(
    () => deliveries.find((d) => d.id === deliveryId),
    [deliveries, deliveryId]
  );

  const relatedBatches = useMemo(() => {
    if (!delivery) return [];
    return batches.filter((b) => delivery.batchNos.includes(b.batchNo));
  }, [delivery, batches]);

  const relatedOrders = useMemo(() => {
    if (!delivery) return [];
    return orders.filter((o) =>
      delivery.batchNos.some(
        (bn) => o.batchNo === bn || o.orderNo === bn
      )
    );
  }, [delivery, orders]);

  if (!delivery) {
    return (
      <View className={styles.container}>
        <View className={styles.section}>
          <Text>配送单不存在</Text>
        </View>
      </View>
    );
  }

  const canSign = currentRole === 'center' && delivery.status === 'delivering';
  const canRecheck =
    currentRole === 'clinic' &&
    (delivery.status === 'signed' || delivery.status === 'delivering');

  const steps = [
    {
      key: 'dispatched',
      label: '发车',
      time: delivery.dispatchedAt || null,
      done: !!delivery.dispatchedAt
    },
    {
      key: 'signed',
      label: '签收',
      time: delivery.signedAt || null,
      done: !!delivery.signedAt
    },
    {
      key: 'rechecked',
      label: '复点',
      time: delivery.recheckedAt || null,
      done: !!delivery.recheckedAt
    }
  ];

  const currentStep = steps.findIndex((s) => !s.done);

  const handleSign = () => {
    if (!signedBy.trim()) {
      Taro.showToast({ title: '请输入签收人', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认签收',
      content: `确认配送单 ${delivery.deliveryNo} 已送达 ${delivery.toClinic}？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          updateDelivery(delivery.id, {
            status: 'signed',
            signedAt: now,
            signedBy: signedBy.trim()
          });
          relatedOrders.forEach((order) => {
            updateOrder(order.id, {
              status: 'signed',
              signedAt: now
            });
          });
          console.info(
            '[DeliveryDetail] Delivery signed:',
            delivery.deliveryNo,
            'by:',
            signedBy
          );
          Taro.showToast({ title: '签收成功', icon: 'success' });
          setShowSignDialog(false);
          setSignedBy('');
        }
      }
    });
  };

  const handleRecheck = (result: 'pass' | 'mismatch') => {
    const actualQty = parseInt(recheckQty) || 0;
    if (result === 'mismatch' && actualQty <= 0) {
      Taro.showToast({ title: '请输入实际数量', icon: 'none' });
      return;
    }
    const resultText = result === 'pass' ? '数量一致' : '数量不符';
    Taro.showModal({
      title: '确认复点',
      content: `确认配送单 ${delivery.deliveryNo} 复点结果：${resultText}？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          updateDelivery(delivery.id, {
            status: 'rechecked',
            recheckedAt: now,
            recheckBy: user.name,
            recheckResult: result,
            remark: recheckRemark || undefined
          });
          if (result === 'pass') {
            relatedOrders.forEach((order) => {
              updateOrder(order.id, {
                status: 'signed',
                signedAt: order.signedAt || now
              });
            });
          }
          console.info(
            '[DeliveryDetail] Delivery rechecked:',
            delivery.deliveryNo,
            'result:',
            result
          );
          Taro.showToast({
            title: result === 'pass' ? '复点通过' : '已记录差异',
            icon: 'success'
          });
          setShowRecheckDialog(false);
          setRecheckQty('');
          setRecheckRemark('');
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.statusBanner}>
        <View>
          <Text className={styles.statusText}>
            {DELIVERY_STATUS_MAP[delivery.status]}
          </Text>
        </View>
        <Text className={styles.deliveryNoText}>{delivery.deliveryNo}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>配送信息</Text>
        <View className={styles.row}>
          <Text className={styles.label}>配送路线</Text>
          <Text className={styles.value}>{delivery.route}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>发货方</Text>
          <Text className={styles.value}>{delivery.fromCenter}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>收货方</Text>
          <Text className={styles.value}>{delivery.toClinic}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>配送司机</Text>
          <Text className={styles.value}>{delivery.driverName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>器械总数</Text>
          <Text className={styles.value}>
            <Text style={{ color: '#0EA5A0', fontWeight: 600, fontSize: 32 }}>
              {delivery.instrumentCount}
            </Text>{' '}
            件
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>配送进度</Text>
        <View className={styles.progress}>
          {steps.map((step, index) => (
            <View key={step.key} className={styles.step}>
              <View className={styles.stepDotWrap}>
                <View
                  className={classnames(
                    index < currentStep || step.done
                      ? styles.stepDotActive
                      : currentStep >= 0 && index === currentStep
                        ? styles.stepDotCurrent
                        : styles.stepDot
                  )}
                />
                {index < steps.length - 1 && (
                  <View
                    className={
                      index < currentStep || step.done
                        ? styles.stepLineActive
                        : styles.stepLine
                    }
                  />
                )}
              </View>
              <Text
                className={
                  index < currentStep || step.done
                    ? styles.stepLabelActive
                    : styles.stepLabel
                }
              >
                {step.label}
              </Text>
              {step.time && (
                <Text className={styles.stepTime}>
                  {formatTime(step.time, 'HH:mm')}
                </Text>
              )}
            </View>
          ))}
        </View>

        {delivery.dispatchedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>发车时间</Text>
            <Text className={styles.detailValue}>
              {formatTime(delivery.dispatchedAt)}
            </Text>
          </View>
        )}
        {delivery.signedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>签收时间</Text>
            <Text className={styles.detailValue}>
              {formatTime(delivery.signedAt)}
            </Text>
          </View>
        )}
        {delivery.signedBy && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>签收人</Text>
            <Text className={styles.detailValue}>{delivery.signedBy}</Text>
          </View>
        )}
        {delivery.recheckedAt && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>复点时间</Text>
            <Text className={styles.detailValue}>
              {formatTime(delivery.recheckedAt)}
            </Text>
          </View>
        )}
        {delivery.recheckBy && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>复点人</Text>
            <Text className={styles.detailValue}>{delivery.recheckBy}</Text>
          </View>
        )}
        {delivery.recheckResult && (
          <View className={styles.detailTime}>
            <Text className={styles.detailLabel}>复点结果</Text>
            <Text
              className={classnames(
                styles.detailValue,
                delivery.recheckResult === 'pass'
                  ? styles.resultPass
                  : styles.resultMismatch
              )}
            >
              {delivery.recheckResult === 'pass' ? '数量一致' : '数量不符'}
            </Text>
          </View>
        )}
      </View>

      {relatedBatches.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>关联批次</Text>
          {relatedBatches.map((batch) => (
            <View key={batch.id} className={styles.batchItem}>
              <View className={styles.batchHeader}>
                <Text className={styles.batchNo}>{batch.batchNo}</Text>
                <StatusTag
                  status={batch.status}
                  statusMap={ORDER_STATUS_MAP}
                  size="small"
                />
              </View>
              <View className={styles.batchInfo}>
                <Text className={styles.batchInfoText}>
                  器械 {batch.instrumentCount} 件
                </Text>
                <Text className={styles.batchInfoText}>
                  操作员 {batch.operatorName}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {relatedOrders.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>关联订单</Text>
          {relatedOrders.map((order) => (
            <View key={order.id} className={styles.orderItem}>
              <View className={styles.orderHeader}>
                <Text className={styles.orderNo}>{order.orderNo}</Text>
                <StatusTag
                  status={order.status}
                  statusMap={ORDER_STATUS_MAP}
                  size="small"
                />
              </View>
              <View className={styles.orderInfo}>
                <Text className={styles.orderInfoText}>
                  {order.clinicName}
                </Text>
                <Text className={styles.orderInfoText}>
                  {order.instrumentCount} 件器械
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {delivery.remark && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>备注</Text>
          <View className={styles.remarkBox}>
            <Text className={styles.remarkText}>{delivery.remark}</Text>
          </View>
        </View>
      )}

      {delivery.status !== 'rechecked' && (
        <View className={styles.placeholder} />
      )}

      {(canSign || canRecheck) && delivery.status !== 'rechecked' && (
        <View className={styles.actionBar}>
          <ScrollView className={styles.actionScroll} scrollX>
            <View className={styles.actionBtns}>
              {canSign && (
                <View
                  className={classnames(
                    styles.actionBtn,
                    styles.actionBtnPrimary
                  )}
                  onClick={() => setShowSignDialog(true)}
                >
                  <Text className={styles.actionBtnTextPrimary}>确认签收</Text>
                </View>
              )}
              {canRecheck && (
                <View
                  className={classnames(
                    styles.actionBtn,
                    styles.actionBtnPrimary
                  )}
                  onClick={() => {
                    setRecheckQty(String(delivery.instrumentCount));
                    setShowRecheckDialog(true);
                  }}
                >
                  <Text className={styles.actionBtnTextPrimary}>收货复点</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {showSignDialog && (
        <View
          className={styles.dialogMask}
          onClick={() => setShowSignDialog(false)}
        >
          <View className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.dialogTitle}>确认签收</Text>
            <Text className={styles.dialogDesc}>
              配送单 {delivery.deliveryNo}
            </Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>签收人</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入签收人姓名"
                value={signedBy}
                onInput={(e) => setSignedBy(e.detail.value)}
              />
            </View>
            <View className={styles.dialogButtons}>
              <View
                className={styles.dialogBtn}
                onClick={() => setShowSignDialog(false)}
              >
                <Text className={styles.dialogBtnText}>取消</Text>
              </View>
              <View
                className={classnames(
                  styles.dialogBtn,
                  styles.dialogBtnPrimary
                )}
                onClick={handleSign}
              >
                <Text className={styles.dialogBtnTextPrimary}>确认签收</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showRecheckDialog && (
        <View
          className={styles.dialogMask}
          onClick={() => setShowRecheckDialog(false)}
        >
          <View className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.dialogTitle}>收货复点</Text>
            <Text className={styles.dialogDesc}>
              应收器械：{delivery.instrumentCount} 件
            </Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>实收数量</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入实收数量"
                value={recheckQty}
                onInput={(e) => setRecheckQty(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>备注（可选）</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="如有差异请说明原因"
                value={recheckRemark}
                onInput={(e) => setRecheckRemark(e.detail.value)}
              />
            </View>
            <View className={styles.recheckButtons}>
              <View
                className={classnames(
                  styles.dialogBtn,
                  styles.dialogBtnSuccess
                )}
                onClick={() => handleRecheck('pass')}
              >
                <Text className={styles.dialogBtnTextPrimary}>数量一致</Text>
              </View>
              <View
                className={classnames(
                  styles.dialogBtn,
                  styles.dialogBtnDanger
                )}
                onClick={() => handleRecheck('mismatch')}
              >
                <Text className={styles.dialogBtnTextDanger}>数量不符</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DeliveryDetailPage;
