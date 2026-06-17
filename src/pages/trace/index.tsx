import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import BatchCard from '@/components/BatchCard';
import DeliveryCard from '@/components/DeliveryCard';
import { useAppStore } from '@/store/useAppStore';
import { SterilePack } from '@/types/instrument';
import { getExpiryDays } from '@/utils/format';
import dayjs from 'dayjs';
import styles from './index.module.scss';

type TraceTab = 'packs' | 'batches' | 'deliveries';

const TracePage: React.FC = () => {
  const { sterilePacks, batches, deliveries, user, updateSterilePack } = useAppStore();
  const [activeTab, setActiveTab] = useState<TraceTab>('packs');
  const [searchValue, setSearchValue] = useState('');
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [selectedPack, setSelectedPack] = useState<SterilePack | null>(null);
  const [patientName, setPatientName] = useState('');
  const [useRemark, setUseRemark] = useState('');

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

  const handlePackClick = (pack: SterilePack) => {
    if (pack.status === 'used') {
      Taro.showToast({ title: '该无菌包已使用', icon: 'none' });
      return;
    }
    if (pack.status === 'expired') {
      Taro.showToast({ title: '该无菌包已过期', icon: 'none' });
      return;
    }
    setSelectedPack(pack);
    setPatientName('');
    setUseRemark('');
    setShowUseDialog(true);
  };

  const handleConfirmUse = () => {
    if (!patientName.trim()) {
      Taro.showToast({ title: '请输入患者姓名', icon: 'none' });
      return;
    }
    if (!selectedPack) return;

    Taro.showModal({
      title: '确认使用',
      content: `确认无菌包 ${selectedPack.packNo} 已用于患者 ${patientName}？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
          updateSterilePack(selectedPack.id, {
            status: 'used',
            usedBy: user.name,
            usedAt: now,
            patientName: patientName.trim()
          });
          console.info(
            '[Trace] Sterile pack used:',
            selectedPack.packNo,
            'for patient:',
            patientName
          );
          Taro.showToast({ title: '已记录使用信息', icon: 'success' });
          setShowUseDialog(false);
          setSelectedPack(null);
        }
      }
    });
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
                <View
                  className={classnames(
                    styles.packCard,
                    pack.status === 'used' && styles.packCardUsed
                  )}
                  key={pack.id}
                  onClick={() => handlePackClick(pack)}
                >
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

      {showUseDialog && selectedPack && (
        <View
          className={styles.dialogMask}
          onClick={() => setShowUseDialog(false)}
        >
          <View className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.dialogTitle}>回填使用信息</Text>
            <Text className={styles.dialogDesc}>
              无菌包 {selectedPack.packNo}
            </Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>患者姓名</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入患者姓名"
                value={patientName}
                onInput={(e) => setPatientName(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>备注（可选）</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入使用备注"
                value={useRemark}
                onInput={(e) => setUseRemark(e.detail.value)}
              />
            </View>
            <View className={styles.dialogButtons}>
              <View
                className={styles.dialogBtn}
                onClick={() => setShowUseDialog(false)}
              >
                <Text className={styles.dialogBtnText}>取消</Text>
              </View>
              <View
                className={classnames(styles.dialogBtn, styles.dialogBtnPrimary)}
                onClick={handleConfirmUse}
              >
                <Text className={styles.dialogBtnTextPrimary}>确认使用</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default TracePage;
