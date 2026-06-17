import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { InstrumentItem, Order } from '@/types/instrument';
import { generateOrderNo } from '@/utils/format';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const defaultInstruments: InstrumentItem[] = [
  { id: 'i1', name: '口镜', category: '检查器械', quantity: 1, sterilizeMethod: '高温高压' },
  { id: 'i2', name: '探针', category: '检查器械', quantity: 1, sterilizeMethod: '高温高压' },
  { id: 'i3', name: '镊子', category: '检查器械', quantity: 1, sterilizeMethod: '高温高压' }
];

const OrderCreatePage: React.FC = () => {
  const { user, addOrder } = useAppStore();
  const [instruments, setInstruments] = useState<InstrumentItem[]>(defaultInstruments);
  const [remark, setRemark] = useState('');

  const handleQuantityChange = (id: string, qty: number) => {
    setInstruments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const handleRemoveInstrument = (id: string) => {
    setInstruments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddInstrument = () => {
    const newId = `i_${Date.now()}`;
    setInstruments((prev) => [
      ...prev,
      { id: newId, name: '新器械', category: '其他', quantity: 1, sterilizeMethod: '高温高压' }
    ]);
  };

  const handleSubmit = () => {
    const totalQty = instruments.reduce((sum, item) => sum + item.quantity, 0);
    const newOrder: Order = {
      id: `o_${Date.now()}`,
      orderNo: generateOrderNo(),
      clinicName: user.clinicName || '未绑定门诊',
      clinicId: user.id,
      instrumentCount: totalQty,
      instruments,
      status: 'pending',
      sealedPhotos: [],
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      remark
    };
    addOrder(newOrder);
    console.info('[OrderCreate] Order created:', newOrder.orderNo);
    Taro.showToast({ title: '已提交', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleSaveDraft = () => {
    Taro.showToast({ title: '已保存草稿', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>发起消毒清单</Text>
        <Text className={styles.subtitle}>填写待消毒器械信息并拍照封箱</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>器械清单</Text>
        <View className={styles.instrumentList}>
          {instruments.map((item) => (
            <View key={item.id} className={styles.instrumentItem}>
              <Text className={styles.instrumentName}>{item.name}</Text>
              <Text className={styles.instrumentQty}>×{item.quantity}</Text>
              <View
                className={styles.removeBtn}
                onClick={() => handleRemoveInstrument(item.id)}
              >
                <Text>移除</Text>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.addBtn} onClick={handleAddInstrument}>
          <Text className={styles.addBtnText}>+ 添加器械</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>拍照封箱</Text>
        <View className={styles.photoSection}>
          <View className={styles.photoGrid}>
            <View className={styles.photoItem}>
              <Text className={styles.photoText}>+</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionLabel}>备注</Text>
        <Textarea
          className={styles.remarkInput}
          placeholder="如有特殊要求请备注"
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
        />
      </View>

      <View className={styles.placeholder} />

      <View className={styles.submitBar}>
        <View className={styles.btnSecondary} onClick={handleSaveDraft}>
          <Text className={styles.btnSecondaryText}>保存草稿</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleSubmit}>
          <Text className={styles.btnPrimaryText}>提交封箱</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCreatePage;
