import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import OrderCard from '@/components/OrderCard';
import { useAppStore } from '@/store/useAppStore';
import { OrderStatus, ORDER_STATUS_MAP, Order } from '@/types/instrument';
import classnames from 'classnames';
import styles from './index.module.scss';

type HandoverTab = 'clinic' | 'center';

const clinicFilters: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待封箱' },
  { key: 'sealed', label: '已封箱' },
  { key: 'delivering', label: '配送中' },
  { key: 'signed', label: '已签收' },
  { key: 'returned', label: '异常退回' }
];

const centerFilters: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'sealed', label: '待接收' },
  { key: 'received', label: '已入库' },
  { key: 'washing', label: '清洗中' },
  { key: 'sterilizing', label: '灭菌中' },
  { key: 'completed', label: '处理完成' }
];

const HandoverPage: React.FC = () => {
  const { orders, currentRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<HandoverTab>('clinic');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = activeTab === 'clinic' ? clinicFilters : centerFilters;

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'sealed').length;
  const processingCount = orders.filter((o) =>
    ['received', 'washing', 'sterilizing'].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) => o.status === 'completed' || o.status === 'delivering').length;

  const filteredOrders = useMemo(() => {
    let result: Order[] = orders;

    if (activeTab === 'clinic') {
      result = orders.filter((o) =>
        ['pending', 'sealed', 'delivering', 'signed', 'returned'].includes(o.status)
      );
    } else {
      result = orders.filter((o) =>
        ['sealed', 'received', 'washing', 'sterilizing', 'completed', 'returned'].includes(o.status)
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter((o) => o.status === activeFilter);
    }

    return result;
  }, [orders, activeTab, activeFilter]);

  const handleCreateOrder = () => {
    Taro.navigateTo({ url: '/pages/order-create/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tab, activeTab === 'clinic' && styles.tabActive)}
          onClick={() => {
            setActiveTab('clinic');
            setActiveFilter('all');
          }}
        >
          <Text
            className={classnames(
              styles.tabText,
              activeTab === 'clinic' && styles.tabTextActive
            )}
          >
            门诊交接
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'center' && styles.tabActive)}
          onClick={() => {
            setActiveTab('center');
            setActiveFilter('all');
          }}
        >
          <Text
            className={classnames(
              styles.tabText,
              activeTab === 'center' && styles.tabTextActive
            )}
          >
            中心接收
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

      <View className={styles.filterRow}>
        {filters.map((f) => (
          <View
            key={f.key}
            className={classnames(
              styles.filterItem,
              activeFilter === f.key && styles.filterItemActive
            )}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text
              className={classnames(
                styles.filterText,
                activeFilter === f.key && styles.filterTextActive
              )}
            >
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无相关订单</Text>
          </View>
        )}
      </View>

      {activeTab === 'clinic' && (
        <View className={styles.fab} onClick={handleCreateOrder}>
          <Text className={styles.fabText}>发起{'\n'}消毒</Text>
        </View>
      )}
    </View>
  );
};

export default HandoverPage;
