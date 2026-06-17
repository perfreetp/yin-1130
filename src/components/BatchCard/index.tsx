import React from 'react';
import { View, Text } from '@tarojs/components';
import { Batch } from '@/types/instrument';
import { BATCH_STATUS_MAP } from '@/types/instrument';
import StatusTag from '@/components/StatusTag';
import { formatTime } from '@/utils/format';
import styles from './index.module.scss';

interface BatchCardProps {
  batch: Batch;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const steps = [
    { key: 'received', label: '入库', time: null, done: true },
    { key: 'washing', label: '清洗', time: batch.washCompletedAt || null, done: !!batch.washCompletedAt },
    { key: 'sterilizing', label: '灭菌', time: batch.sterilizeCompletedAt || null, done: !!batch.sterilizeCompletedAt },
    { key: 'completed', label: '完成', time: batch.completedAt || null, done: batch.status === 'completed' }
  ];

  const currentStep = batch.status === 'returned' ? -1 : steps.findIndex((s) => !s.done);

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.batchNo}>{batch.batchNo}</Text>
        <StatusTag status={batch.status} statusMap={BATCH_STATUS_MAP} size="small" />
      </View>

      <View className={styles.info}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>器械数量</Text>
          <Text className={styles.infoValue}>{batch.instrumentCount} 件</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>操作员</Text>
          <Text className={styles.infoValue}>{batch.operatorName}</Text>
        </View>
        {batch.isSplit && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>拆分</Text>
            <Text className={styles.infoValue}>已拆包</Text>
          </View>
        )}
        {batch.isMerged && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>合包</Text>
            <Text className={styles.infoValue}>已合包</Text>
          </View>
        )}
      </View>

      {batch.status !== 'returned' && (
        <View className={styles.progress}>
          {steps.map((step, index) => (
            <View key={step.key} className={styles.step}>
              <View className={styles.stepDotWrap}>
                <View
                  className={
                    index <= currentStep || step.done
                      ? styles.stepDotActive
                      : index === currentStep + 1 || (currentStep === -1 && index === 1)
                        ? styles.stepDotCurrent
                        : styles.stepDot
                  }
                />
                {index < steps.length - 1 && (
                  <View
                    className={
                      index < currentStep || step.done ? styles.stepLineActive : styles.stepLine
                    }
                  />
                )}
              </View>
              <Text
                className={
                  index <= currentStep || step.done
                    ? styles.stepLabelActive
                    : styles.stepLabel
                }
              >
                {step.label}
              </Text>
              {step.time && (
                <Text className={styles.stepTime}>{formatTime(step.time, 'HH:mm')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {batch.status === 'returned' && batch.remark && (
        <View className={styles.returnReason}>
          <Text className={styles.returnText}>退回原因：{batch.remark}</Text>
        </View>
      )}
    </View>
  );
};

export default BatchCard;
