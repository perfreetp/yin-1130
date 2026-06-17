import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import OrderCard from '@/components/OrderCard';
import { useAppStore } from '@/store/useAppStore';
import { SterilePack } from '@/types/instrument';
import { getExpiryDays } from '@/utils/format';
import styles from './index.module.scss';

const WorkspacePage: React.FC = () => {
  const { orders, sterilePacks, currentRole, user } = useAppStore();

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'sealed').length;
  const processingCount = orders.filter((o) =>
    ['received', 'washing', 'sterilizing'].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) => o.status === 'completed' || o.status === 'delivering').length;

  const recentOrders = orders.slice(0, 5);

  const expiringPacks = sterilePacks.filter(
    (p) => p.status === 'expiring' || p.status === 'expired'
  );

  const handleCreateOrder = () => {
    Taro.navigateTo({ url: '/pages/order-create/index' });
  };

  const handleScan = () => {
    Taro.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.info('[Workspace] Scan result:', res.result);
        Taro.navigateTo({ url: `/pages/trace-query/index?code=${res.result}` });
      },
      fail: (err) => {
        console.error('[Workspace] Scan failed:', err);
      }
    });
  };

  const handleTrace = () => {
    Taro.navigateTo({ url: '/pages/trace-query/index' });
  };

  const handleViewDeliveries = () => {
    Taro.switchTab({ url: '/pages/trace/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>
          {currentRole === 'clinic' ? user.clinicName : user.name}
        </Text>
        <View className={styles.roleBadge}>
          <Text className={styles.roleText}>
            {currentRole === 'clinic' ? '门诊端' : '供应中心端'}
          </Text>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{pendingCount}</Text>
          <Text className={styles.statLabel}>待交接</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{processingCount}</Text>
          <Text className={styles.statLabel}>处理中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{completedCount}</Text>
          <Text className={styles.statLabel}>待配送</Text>
        </View>
      </View>

      <View className={styles.quickActions}>
        <Text className={styles.sectionTitle}>快捷操作</Text>
        <View className={styles.actionGrid}>
          <View className={styles.actionItem} onClick={handleCreateOrder}>
            <View className={`${styles.actionIcon} ${styles.actionIconPrimary}`}>
              <Text style={{ color: '#fff' }}>📋</Text>
            </View>
            <Text className={styles.actionName}>发起消毒</Text>
          </View>
          <View className={styles.actionItem} onClick={handleScan}>
            <View className={`${styles.actionIcon} ${styles.actionIconWarning}`}>
              <Text style={{ color: '#fff' }}>📷</Text>
            </View>
            <Text className={styles.actionName}>扫码入库</Text>
          </View>
          <View className={styles.actionItem} onClick={handleTrace}>
            <View className={`${styles.actionIcon} ${styles.actionIconInfo}`}>
              <Text style={{ color: '#fff' }}>🔍</Text>
            </View>
            <Text className={styles.actionName}>追溯查询</Text>
          </View>
          <View className={styles.actionItem} onClick={handleViewDeliveries}>
            <View className={`${styles.actionIcon} ${styles.actionIconSuccess}`}>
              <Text style={{ color: '#fff' }}>🚚</Text>
            </View>
            <Text className={styles.actionName}>配送签收</Text>
          </View>
        </View>
      </View>

      {expiringPacks.length > 0 && (
        <View className={styles.packWarningSection}>
          <View className={styles.warningCard}>
            <View className={styles.warningHeader}>
              <Text className={styles.warningTitle}>效期预警</Text>
              <Text className={styles.warningCount}>{expiringPacks.length} 件需关注</Text>
            </View>
            {expiringPacks.map((pack: SterilePack) => (
              <View key={pack.id} className={styles.warningItem}>
                <Text className={styles.warningPackNo}>{pack.instrumentName}</Text>
                <Text className={styles.warningExpiry}>
                  {pack.status === 'expired'
                    ? '已过期'
                    : `${getExpiryDays(pack.expiryDate)}天后过期`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.recentSection}>
        <Text className={styles.sectionTitle}>最近订单</Text>
        {recentOrders.length > 0 ? (
          <View className={styles.recentList}>
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无订单</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default WorkspacePage;
