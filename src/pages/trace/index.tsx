import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import BatchCard from '@/components/BatchCard';
import DeliveryCard from '@/components/DeliveryCard';
import { useAppStore } from '@/store/useAppStore';
import { SterilePack } from '@/types/instrument';
import { getExpiryDays } from '@/utils/format';
import styles from './index.module.scss';

type TraceTab = 'packs' | 'batches' | 'deliveries';

const TracePage: React.FC = () => {
  const { sterilePacks, batches, deliveries } = useAppStore();
  const [activeTab, setActiveTab] = useState<TraceTab>('packs');
  const [searchValue, setSearchValue] = useState('');

  const filteredPacks = useMemo(() => {
    if (!searchValue) return sterilePacks;
    return sterilePacks.filter(
      (p) =>
        p.packNo.includes(searchValue) ||
        p.instrumentName.includes(searchValue) ||
        p.batchNo.includes(searchValue)
    );
  }, [sterilePacks, searchValue]);

  const filteredBatches = useMemo(() => {
    if (!searchValue) return batches;
    return batches.filter((b) => b.batchNo.includes(searchValue));
  }, [batches, searchValue]);

  const filteredDeliveries = useMemo(() => {
    if (!searchValue) return deliveries;
    return deliveries.filter(
      (d) => d.deliveryNo.includes(searchValue) || d.route.includes(searchValue)
    );
  }, [deliveries, searchValue]);

  const handleSearch = () => {
    if (searchValue) {
      Taro.navigateTo({ url: `/pages/trace-query/index?code=${searchValue}` });
    }
  };

  const getExpiryClass = (pack: SterilePack) => {
    if (pack.status === 'expired') return styles.expiryExpired;
    if (pack.status === 'expiring') return styles.expiryWarning;
    return styles.expiryValid;
  };

  const getExpiryText = (pack: SterilePack) => {
    if (pack.status === 'expired') return '已过期';
    if (pack.status === 'used') return `已使用 · ${pack.patientName || ''}`;
    const days = getExpiryDays(pack.expiryDate);
    if (days <= 0) return '已过期';
    if (days <= 7) return `${days}天后过期`;
    return pack.expiryDate;
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="搜索追溯码/批次号/器械名"
          value={searchValue}
          onInput={(e) => setSearchValue(e.detail.value)}
          onConfirm={handleSearch}
        />
        <View className={styles.searchBtn} onClick={handleSearch}>
          <Text className={styles.searchBtnText}>查询</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tab, activeTab === 'packs' && styles.tabActive)}
          onClick={() => setActiveTab('packs')}
        >
          <Text
            className={classnames(styles.tabText, activeTab === 'packs' && styles.tabTextActive)}
          >
            无菌包
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'batches' && styles.tabActive)}
          onClick={() => setActiveTab('batches')}
        >
          <Text
            className={classnames(
              styles.tabText,
              activeTab === 'batches' && styles.tabTextActive
            )}
          >
            批次处理
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'deliveries' && styles.tabActive)}
          onClick={() => setActiveTab('deliveries')}
        >
          <Text
            className={classnames(
              styles.tabText,
              activeTab === 'deliveries' && styles.tabTextActive
            )}
          >
            配送签收
          </Text>
        </View>
      </View>

      <View className={styles.content}>
        {activeTab === 'packs' && (
          <>
            {filteredPacks.length > 0 ? (
              filteredPacks.map((pack) => (
                <View className={styles.packCard} key={pack.id}>
                  <View className={styles.packHeader}>
                    <Text className={styles.packNo}>{pack.packNo}</Text>
                  </View>
                  <View className={styles.packInfo}>
                    <View className={styles.packRow}>
                      <Text className={styles.packLabel}>器械</Text>
                      <Text className={styles.packValue}>{pack.instrumentName}</Text>
                    </View>
                    <View className={styles.packRow}>
                      <Text className={styles.packLabel}>灭菌方式</Text>
                      <Text className={styles.packValue}>{pack.sterilizeMethod}</Text>
                    </View>
                    <View className={styles.packRow}>
                      <Text className={styles.packLabel}>灭菌日期</Text>
                      <Text className={styles.packValue}>{pack.sterilizeDate}</Text>
                    </View>
                  </View>
                  <View className={styles.packExpiry}>
                    <Text className={styles.expiryLabel}>效期状态</Text>
                    <Text className={classnames(styles.expiryDate, getExpiryClass(pack))}>
                      {getExpiryText(pack)}
                    </Text>
                  </View>
                  {pack.status === 'used' && pack.patientName && (
                    <View className={styles.usedInfo}>
                      <Text className={styles.usedText}>
                        使用患者：{pack.patientName} · {pack.usedAt}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无无菌包记录</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'batches' && (
          <>
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => <BatchCard key={batch.id} batch={batch} />)
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无批次记录</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'deliveries' && (
          <>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无配送记录</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default TracePage;
