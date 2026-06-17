import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import StatusTag from '@/components/StatusTag';
import { mockReconciliations } from '@/data/mock';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const RECON_STATUS_MAP: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认'
};

const ReconciliationPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState('2026-06');

  const reconciliations = useMemo(() => {
    return mockReconciliations.filter((r) => r.month === currentMonth);
  }, [currentMonth]);

  const totalOrders = reconciliations.reduce((sum, r) => sum + r.totalOrders, 0);
  const totalInstruments = reconciliations.reduce((sum, r) => sum + r.totalInstruments, 0);
  const totalAmount = reconciliations.reduce((sum, r) => sum + r.totalAmount, 0);

  const handlePrevMonth = () => {
    const prev = dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM');
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = dayjs(currentMonth).add(1, 'month').format('YYYY-MM');
    setCurrentMonth(next);
  };

  const handleExport = (id: string) => {
    Taro.showToast({ title: '对账凭证导出中...', icon: 'none' });
    console.info('[Reconciliation] Exporting:', id);
  };

  return (
    <View className={styles.container}>
      <View className={styles.monthSelector}>
        <View className={styles.monthBtn} onClick={handlePrevMonth}>
          <Text className={styles.monthBtnText}>‹</Text>
        </View>
        <Text className={styles.monthText}>{currentMonth}</Text>
        <View className={styles.monthBtn} onClick={handleNextMonth}>
          <Text className={styles.monthBtnText}>›</Text>
        </View>
      </View>

      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNumber}>{totalOrders}</Text>
          <Text className={styles.summaryLabel}>订单数</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNumber}>{totalInstruments}</Text>
          <Text className={styles.summaryLabel}>器械总数</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNumber}>¥{totalAmount}</Text>
          <Text className={styles.summaryLabel}>总金额</Text>
        </View>
      </View>

      <View className={styles.list}>
        {reconciliations.length > 0 ? (
          reconciliations.map((item) => (
            <View className={styles.reconCard} key={item.id}>
              <View className={styles.reconHeader}>
                <Text className={styles.clinicName}>{item.clinicName}</Text>
                <StatusTag status={item.status} statusMap={RECON_STATUS_MAP} size="small" />
              </View>
              <View className={styles.reconBody}>
                <View className={styles.reconRow}>
                  <Text className={styles.reconLabel}>订单数</Text>
                  <Text className={styles.reconValue}>{item.totalOrders} 单</Text>
                </View>
                <View className={styles.reconRow}>
                  <Text className={styles.reconLabel}>器械总数</Text>
                  <Text className={styles.reconValue}>{item.totalInstruments} 件</Text>
                </View>
                <View className={styles.reconRow}>
                  <Text className={styles.reconLabel}>总金额</Text>
                  <Text className={styles.reconAmount}>¥{item.totalAmount}</Text>
                </View>
              </View>
              <View className={styles.reconFooter}>
                <Text className={styles.reconDate}>生成于 {item.generatedAt}</Text>
                <View className={styles.exportBtn} onClick={() => handleExport(item.id)}>
                  <Text className={styles.exportBtnText}>导出凭证</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>该月暂无对账记录</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReconciliationPage;
