import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { OrderStatus, BATCH_STATUS_MAP, DELIVERY_STATUS_MAP, ORDER_STATUS_MAP } from '@/types/instrument';
import styles from './index.module.scss';

interface StatusTagProps {
  status: OrderStatus | string;
  statusMap?: Record<string, string>;
  size?: 'small' | 'normal';
}

const defaultStatusColorMap: Record<string, string> = {
  pending: styles.pending,
  sealed: styles.pending,
  received: styles.processing,
  washing: styles.processing,
  sterilizing: styles.processing,
  completed: styles.completed,
  delivering: styles.processing,
  signed: styles.completed,
  returned: styles.error,
  rechecked: styles.completed,
  valid: styles.completed,
  expiring: styles.warning,
  expired: styles.error,
  used: styles.used,
  confirmed: styles.completed
};

const StatusTag: React.FC<StatusTagProps> = ({ status, statusMap, size = 'normal' }) => {
  const label = statusMap ? statusMap[status] : ORDER_STATUS_MAP[status as OrderStatus] || status;
  const colorClass = defaultStatusColorMap[status] || styles.pending;

  return (
    <View className={classnames(styles.tag, colorClass, size === 'small' && styles.small)}>
      <Text className={styles.text}>{label}</Text>
    </View>
  );
};

export default StatusTag;
