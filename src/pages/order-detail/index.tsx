import React, { useMemo, useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { ORDER_STATUS_MAP, Batch } from '@/types/instrument';
import StatusTag from '@/components/StatusTag';
import { formatTime, generateBatchNo } from '@/utils/format';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const OrderDetailPage: React.FC = () => {
  const { orders, currentRole, user, updateOrder, addBatch } = useAppStore();
  const [receiveRemark, setReceiveRemark] = useState('');

  const params = Taro.getCurrentInstance().router?.params;
  const orderId = params?.id || '';

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  if (!order) {
    return (
      <View className={styles.container}>
        <View className={styles.section}>
          <Text>订单不存在</Text>
        </View>
      </View>
    );
  }

  const isCenterReceiveReady = currentRole === 'center' && order.status === 'sealed';
  const isClinicReceiveReady =
    currentRole === 'clinic' && order.status === 'delivering';

  const timelineItems = [
    { key: 'created', label: '创建订单', time: order.createdAt, active: true },
    {
      key: 'sealed',
      label: '拍照封箱',
      time: order.status !== 'pending' ? order.createdAt : null,
      active: order.status !== 'pending'
    },
    {
      key: 'received',
      label: '中心入库',
      time: order.receivedAt || null,
      active: !!order.receivedAt
    },
    {
      key: 'completed',
      label: '处理完成',
      time: order.completedAt || null,
      active: !!order.completedAt
    },
    {
      key: 'delivered',
      label: '配送中',
      time: order.deliveredAt || null,
      active: !!order.deliveredAt
    },
    {
      key: 'signed',
      label: '已签收',
      time: order.signedAt || null,
      active: !!order.signedAt
    }
  ];

  if (order.status === 'returned') {
    timelineItems.push({
      key: 'returned',
      label: '异常退回',
      time: null,
      active: true
    });
  }

  const handleConfirmReceive = () => {
    Taro.showModal({
      title: '确认入库',
      content: `确认订单 ${order.orderNo} 的 ${order.instrumentCount} 件器械数量无误，入库处理？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          const batchNo = order.batchNo || generateBatchNo();

          updateOrder(order.id, {
            status: 'received',
            receivedAt: now,
            batchNo
          });

          const existingBatch = useAppStore.getState().batches.find((b) => b.batchNo === batchNo);
          if (!existingBatch) {
            const newBatch: Batch = {
              id: `b_${Date.now()}`,
              batchNo,
              orderNos: [order.orderNo],
              instrumentCount: order.instrumentCount,
              status: 'received',
              operatorName: user.name,
              isSplit: false,
              isMerged: false
            };
            addBatch(newBatch);
            console.info('[OrderDetail] Batch created:', batchNo, 'for order:', order.orderNo);
          }

          console.info('[OrderDetail] Order received:', order.orderNo, 'by:', user.name);
          Taro.showToast({ title: '入库成功', icon: 'success' });

          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handleQuantityMismatch = () => {
    Taro.showActionSheet({
      itemList: ['数量偏少', '数量偏多', '器械不符', '包装破损'],
      success: (res) => {
        const reasons = ['数量偏少', '数量偏多', '器械不符', '包装破损'];
        Taro.showModal({
          title: '数量异常',
          content: `您选择了：${reasons[res.tapIndex]}，是否退回该订单？`,
          confirmText: '退回',
          success: (modalRes) => {
            if (modalRes.confirm) {
              updateOrder(order.id, {
                status: 'returned',
                remark: receiveRemark || reasons[res.tapIndex]
              });
              console.info('[OrderDetail] Order returned:', order.orderNo, 'reason:', reasons[res.tapIndex]);
              Taro.showToast({ title: '已退回', icon: 'success' });
              setTimeout(() => {
                Taro.navigateBack();
              }, 1500);
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
          <Text className={styles.statusText}>{ORDER_STATUS_MAP[order.status]}</Text>
        </View>
        <Text className={styles.orderNoText}>{order.orderNo}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.row}>
          <Text className={styles.label}>门诊</Text>
          <Text className={styles.value}>{order.clinicName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>器械数量</Text>
          <Text className={styles.value}>
            <Text style={{ color: '#0EA5A0', fontWeight: 600, fontSize: 32 }}>
              {order.instrumentCount}
            </Text>{' '}
            件
          </Text>
        </View>
        {order.batchNo && (
          <View className={styles.row}>
            <Text className={styles.label}>批次号</Text>
            <Text className={styles.value}>{order.batchNo}</Text>
          </View>
        )}
        <View className={styles.row}>
          <Text className={styles.label}>创建时间</Text>
          <Text className={styles.value}>{formatTime(order.createdAt)}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>器械清单</Text>
        {order.instruments.map((inst) => (
          <View key={inst.id} className={styles.row}>
            <Text className={styles.label}>{inst.name}</Text>
            <Text className={styles.value}>
              <Text style={{ color: '#0EA5A0', fontWeight: 500 }}>{inst.quantity}</Text>件 ·{' '}
              {inst.sterilizeMethod}
            </Text>
          </View>
        ))}
      </View>

      {isCenterReceiveReady && (
        <View className={styles.receiveSection}>
          <Text className={styles.sectionTitle}>中心接收核对</Text>
          <Text className={styles.receiveTip}>
            请核对器械数量是否与封箱一致，共 {order.instrumentCount} 件
          </Text>
          <Textarea
            className={styles.receiveRemark}
            placeholder="如有异常请备注（可选）"
            value={receiveRemark}
            onInput={(e) => setReceiveRemark(e.detail.value)}
          />
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>处理进度</Text>
        <View className={styles.timeline}>
          {timelineItems.map((item) => (
            <View key={item.key} className={styles.timelineItem}>
              <View
                className={item.active ? styles.timelineDot : styles.timelineDotInactive}
              />
              <View className={styles.timelineContent}>
                <Text
                  className={classnames(
                    styles.timelineTitle,
                    item.active && styles.timelineTitleActive
                  )}
                >
                  {item.label}
                </Text>
                {item.time && (
                  <Text className={styles.timelineTime}>{formatTime(item.time)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {order.sealedPhotos && order.sealedPhotos.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>封箱照片</Text>
            <Text className={styles.photoCount}>{order.sealedPhotos.length} 张</Text>
          </View>
          <View className={styles.photoGrid}>
            {order.sealedPhotos.map((photo, index) => (
              <Image
                key={index}
                className={styles.photoItem}
                src={photo}
                mode="aspectFill"
                onClick={() =>
                  Taro.previewImage({
                    urls: order.sealedPhotos || [],
                    current: photo
                  })
                }
                onError={(e) => {
                  console.error('[OrderDetail] Image load error:', e);
                }}
              />
            ))}
          </View>
        </View>
      )}

      {order.remark && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>备注</Text>
          <View className={styles.remarkBox}>
            <Text className={styles.remarkText}>{order.remark}</Text>
          </View>
        </View>
      )}

      {isCenterReceiveReady && <View className={styles.placeholder} />}

      {isCenterReceiveReady && (
        <View className={styles.actionBar}>
          <View className={styles.btnSecondary} onClick={handleQuantityMismatch}>
            <Text className={styles.btnSecondaryText}>数量不符</Text>
          </View>
          <View className={styles.btnPrimary} onClick={handleConfirmReceive}>
            <Text className={styles.btnPrimaryText}>确认入库</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;
