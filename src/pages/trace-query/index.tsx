import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { formatTime } from '@/utils/format';
import styles from './index.module.scss';

const TraceQueryPage: React.FC = () => {
  const { orders, batches, sterilePacks } = useAppStore();
  const [queryCode, setQueryCode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  const params = Taro.getCurrentInstance().router?.params;
  const initialCode = params?.code || '';
  if (initialCode && !queryCode) {
    setQueryCode(initialCode);
  }

  const handleSearch = () => {
    if (!queryCode.trim()) {
      Taro.showToast({ title: '请输入追溯码', icon: 'none' });
      return;
    }

    const pack = sterilePacks.find(
      (p) => p.packNo === queryCode || p.batchNo === queryCode
    );
    const order = orders.find((o) => o.orderNo === queryCode || o.batchNo === queryCode);
    const batch = batches.find((b) => b.batchNo === queryCode);

    if (pack) {
      setSearchResult({ type: 'pack', data: pack });
    } else if (order) {
      setSearchResult({ type: 'order', data: order });
    } else if (batch) {
      setSearchResult({ type: 'batch', data: batch });
    } else {
      setSearchResult(null);
      Taro.showToast({ title: '未找到相关记录', icon: 'none' });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>追溯查询</Text>
        <Text className={styles.subtitle}>输入追溯码、批次号或订单号查询</Text>
      </View>

      <View className={styles.searchBox}>
        <Input
          className={styles.searchInput}
          placeholder="追溯码/批次号/订单号"
          value={queryCode}
          onInput={(e) => setQueryCode(e.detail.value)}
          onConfirm={handleSearch}
        />
        <View className={styles.searchBtn} onClick={handleSearch}>
          <Text className={styles.searchBtnText}>查询</Text>
        </View>
      </View>

      {searchResult && searchResult.type === 'pack' && (
        <View className={styles.resultSection}>
          <Text className={styles.resultTitle}>无菌包信息</Text>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>包号</Text>
            <Text className={styles.resultValue}>{searchResult.data.packNo}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>器械</Text>
            <Text className={styles.resultValue}>{searchResult.data.instrumentName}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>灭菌方式</Text>
            <Text className={styles.resultValue}>{searchResult.data.sterilizeMethod}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>灭菌日期</Text>
            <Text className={styles.resultValue}>{searchResult.data.sterilizeDate}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>效期</Text>
            <Text className={styles.resultValue}>{searchResult.data.expiryDate}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>批次号</Text>
            <Text className={styles.resultValue}>{searchResult.data.batchNo}</Text>
          </View>
          {searchResult.data.patientName && (
            <View className={styles.resultRow}>
              <Text className={styles.resultLabel}>使用患者</Text>
              <Text className={styles.resultValue}>{searchResult.data.patientName}</Text>
            </View>
          )}
        </View>
      )}

      {searchResult && searchResult.type === 'order' && (
        <View className={styles.resultSection}>
          <Text className={styles.resultTitle}>订单信息</Text>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>订单号</Text>
            <Text className={styles.resultValue}>{searchResult.data.orderNo}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>门诊</Text>
            <Text className={styles.resultValue}>{searchResult.data.clinicName}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>器械数</Text>
            <Text className={styles.resultValue}>{searchResult.data.instrumentCount} 件</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>创建时间</Text>
            <Text className={styles.resultValue}>
              {formatTime(searchResult.data.createdAt)}
            </Text>
          </View>
        </View>
      )}

      {searchResult && searchResult.type === 'batch' && (
        <View className={styles.resultSection}>
          <Text className={styles.resultTitle}>批次信息</Text>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>批次号</Text>
            <Text className={styles.resultValue}>{searchResult.data.batchNo}</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>器械数</Text>
            <Text className={styles.resultValue}>{searchResult.data.instrumentCount} 件</Text>
          </View>
          <View className={styles.resultRow}>
            <Text className={styles.resultLabel}>操作员</Text>
            <Text className={styles.resultValue}>{searchResult.data.operatorName}</Text>
          </View>
        </View>
      )}

      {!searchResult && queryCode && (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>输入追溯码查询消毒全过程</Text>
        </View>
      )}
    </View>
  );
};

export default TraceQueryPage;
