import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const DeliveryDetailPage: React.FC = () => {
  return (
    <View className={styles.container}>
      <Text className={styles.title}>配送详情</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  );
};

export default DeliveryDetailPage;
