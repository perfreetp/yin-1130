import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockReconciliations, mockOrders } from '@/data/mock';
import { MonthlyReconciliation } from '@/types/instrument';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const RECON_STATUS_MAP: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认'
};

const ReconciliationPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState('2026-06');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportContent, setExportContent] = useState('');
  const [exportRecon, setExportRecon] = useState<MonthlyReconciliation | null>(null);

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

  const generateExportContent = (recon: MonthlyReconciliation) => {
    const relatedOrders = mockOrders.filter(
      (o) => o.clinicId === recon.clinicId && dayjs(o.createdAt).format('YYYY-MM') === recon.month
    );

    const lines = [];
    lines.push('========================================');
    lines.push('       区域口腔消毒供应中心');
    lines.push('         月度对账凭证');
    lines.push('========================================');
    lines.push('');
    lines.push(`对账月份：${recon.month}`);
    lines.push(`诊所名称：${recon.clinicName}`);
    lines.push(`诊所编号：${recon.clinicId}`);
    lines.push(`生成时间：${recon.generatedAt}`);
    lines.push(`凭证编号：PZ-${recon.month}-${recon.id.padStart(4, '0')}`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('                 汇总');
    lines.push('----------------------------------------');
    lines.push(`订单总数：${recon.totalOrders} 单`);
    lines.push(`器械总数：${recon.totalInstruments} 件`);
    lines.push(`总 金 额：¥${recon.totalAmount.toFixed(2)}`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('               订单明细');
    lines.push('----------------------------------------');

    if (relatedOrders.length > 0) {
      relatedOrders.forEach((order, idx) => {
        lines.push(`${idx + 1}. ${order.orderNo}`);
        lines.push(`   器械数量：${order.instrumentCount} 件`);
        lines.push(`   创建时间：${order.createdAt}`);
        lines.push(`   状态：${order.status}`);
        order.instruments.forEach((inst) => {
          lines.push(`   - ${inst.name} × ${inst.quantity}`);
        });
        lines.push('');
      });
    } else {
      lines.push('暂无订单明细数据');
      lines.push('');
    }

    lines.push('----------------------------------------');
    lines.push('               费用明细');
    lines.push('----------------------------------------');
    const unitPrice = recon.totalInstruments > 0 ? recon.totalAmount / recon.totalInstruments : 0;
    lines.push(`消毒单价：¥${unitPrice.toFixed(2)}/件`);
    lines.push(`器械数量：${recon.totalInstruments} 件`);
    lines.push(`应收金额：¥${recon.totalAmount.toFixed(2)}`);
    lines.push('');
    lines.push('========================================');
    lines.push('    本凭证由系统自动生成，具有法律效力');
    lines.push('========================================');

    return lines.join('\n');
  };

  const handleExport = (recon: MonthlyReconciliation) => {
    const content = generateExportContent(recon);
    setExportRecon(recon);
    setExportContent(content);
    setShowExportDialog(true);
    console.info('[Reconciliation] Exporting:', recon.id, content);
  };

  const handleCopy = async () => {
    try {
      await Taro.setClipboardData({ data: exportContent });
      Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: '复制失败，请重试', icon: 'none' });
    }
  };

  const handleSave = () => {
    Taro.showModal({
      title: '导出凭证',
      content: '凭证内容已生成，是否保存到本地？\n\n（H5环境下可复制内容后保存）',
      success: (res) => {
        if (res.confirm) {
          handleCopy();
        }
      }
    });
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
                <View className={styles.exportBtn} onClick={() => handleExport(item)}>
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

      {showExportDialog && exportRecon && (
        <View
          className={styles.dialogMask}
          onClick={() => setShowExportDialog(false)}
        >
          <View
            className={styles.exportDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <Text className={styles.dialogTitle}>对账凭证预览</Text>
            <Text className={styles.dialogSubtitle}>
              {exportRecon.clinicName} · {exportRecon.month}
            </Text>

            <ScrollView className={styles.exportContent} scrollY>
              <Text className={styles.exportText} selectable>
                {exportContent}
              </Text>
            </ScrollView>

            <View className={styles.dialogButtons}>
              <View
                className={classnames(styles.dialogBtn, styles.dialogBtnSecondary)}
                onClick={handleCopy}
              >
                <Text className={styles.dialogBtnText}>复制内容</Text>
              </View>
              <View
                className={classnames(styles.dialogBtn, styles.dialogBtnPrimary)}
                onClick={handleSave}
              >
                <Text className={styles.dialogBtnTextPrimary}>保存凭证</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReconciliationPage;
