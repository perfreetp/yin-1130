import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { ORDER_STATUS_MAP, Order } from '@/types/instrument';
import StatusTag from '@/components/StatusTag';
import { formatTime } from '@/utils/format';
import styles from './index.module.scss';

const OrderDetailPage: React.FC = () => {
  const { orders } = useAppStore();

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

  const timelineItems = [
    { key: 'created', label: '创建订单', time: order.createdAt, active: true },
    {
      key: 'sealed',
      label: '拍照封箱',
      time: order.status !== 'pending' ? order.sealedPhotos?.length > 0 ? order.createdAt : null : null,
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

  return (
    <View className={styles.container}>
      <View className={styles.statusBanner}>
        <View>
          <Text className={styles.statusText}>
            {ORDER_STATUS_MAP[order.status]}
          </Text>
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
          <Text className={styles.value}>{order.instrumentCount} 件</Text>
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
              {inst.quantity}件 · {inst.sterilizeMethod}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>处理进度</Text>
        <View className={styles.timeline}>
          {timelineItems.map((item) => (
            <View key={item.key} className={styles.timelineItem}>
              <View
                className={item.active ? styles.timelineDot : styles.timelineDotInactive}
              />
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>{item.label}</Text>
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
          <Text className={styles.sectionTitle}>封箱照片</Text>
          <View className={styles.photoGrid}>
            {order.sealedPhotos.map((photo, index) => (
              <Image
                key={index}
                className={styles.photoItem}
                src={photo}
                mode="aspectFill"
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
    </View>
  );
};

export default OrderDetailPage;
