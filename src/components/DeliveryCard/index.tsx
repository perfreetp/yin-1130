import React from 'react';
import { View, Text } from '@tarojs/components';
import { Delivery } from '@/types/instrument';
import { DELIVERY_STATUS_MAP } from '@/types/instrument';
import StatusTag from '@/components/StatusTag';
import { formatTime } from '@/utils/format';
import styles from './index.module.scss';

interface DeliveryCardProps {
  delivery: Delivery;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery }) => {
  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.deliveryNo}>{delivery.deliveryNo}</Text>
        <StatusTag status={delivery.status} statusMap={DELIVERY_STATUS_MAP} size="small" />
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>配送路线</Text>
          <Text className={styles.value}>{delivery.route}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>器械数量</Text>
          <Text className={styles.value}>{delivery.instrumentCount} 件</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>配送司机</Text>
          <Text className={styles.value}>{delivery.driverName}</Text>
        </View>
        {delivery.signedBy && (
          <View className={styles.row}>
            <Text className={styles.label}>签收人</Text>
            <Text className={styles.value}>{delivery.signedBy}</Text>
          </View>
        )}
        {delivery.recheckResult && (
          <View className={styles.row}>
            <Text className={styles.label}>复点结果</Text>
            <Text className={delivery.recheckResult === 'pass' ? styles.pass : styles.mismatch}>
              {delivery.recheckResult === 'pass' ? '数量一致' : '数量不符'}
            </Text>
          </View>
        )}
      </View>
      <View className={styles.footer}>
        {delivery.dispatchedAt && (
          <Text className={styles.time}>发车：{formatTime(delivery.dispatchedAt, 'MM-DD HH:mm')}</Text>
        )}
        {delivery.signedAt && (
          <Text className={styles.time}>签收：{formatTime(delivery.signedAt, 'MM-DD HH:mm')}</Text>
        )}
      </View>
    </View>
  );
};

export default DeliveryCard;
