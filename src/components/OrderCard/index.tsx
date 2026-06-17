import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { Order } from '@/types/instrument';
import { ORDER_STATUS_MAP } from '@/types/instrument';
import { formatTime } from '@/utils/format';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.orderNo}>{order.orderNo}</Text>
        <StatusTag status={order.status} statusMap={ORDER_STATUS_MAP} size="small" />
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>门诊</Text>
          <Text className={styles.value}>{order.clinicName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>器械</Text>
          <Text className={styles.value}>{order.instrumentCount} 件</Text>
        </View>
        {order.batchNo && (
          <View className={styles.row}>
            <Text className={styles.label}>批次</Text>
            <Text className={classnames(styles.value, styles.batchNo)}>{order.batchNo}</Text>
          </View>
        )}
      </View>
      <View className={styles.footer}>
        <Text className={styles.time}>{formatTime(order.createdAt)}</Text>
        {order.remark && <Text className={styles.remark}>{order.remark}</Text>}
      </View>
    </View>
  );
};

export default OrderCard;
