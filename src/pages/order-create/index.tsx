import React, { useState } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { InstrumentItem, Order } from '@/types/instrument';
import { generateOrderNo, generateBatchNo } from '@/utils/format';
import dayjs from 'dayjs';
import classnames from 'classnames';
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
  const [sealedPhotos, setSealedPhotos] = useState<string[]>([]);

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 9 - sealedPhotos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = res.tempFilePaths;
        if (newPhotos.length > 0) {
          setSealedPhotos((prev) => [...prev, ...newPhotos]);
          console.info('[OrderCreate] Photos added:', newPhotos.length, '张');
          Taro.showToast({ title: `已添加${newPhotos.length}张照片`, icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('[OrderCreate] Choose image failed:', err);
        Taro.showToast({ title: '未选择照片', icon: 'none' });
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    Taro.showModal({
      title: '提示',
      content: '确认删除这张照片？',
      success: (res) => {
        if (res.confirm) {
          setSealedPhotos((prev) => prev.filter((_, i) => i !== index));
        }
      }
    });
  };

  const handlePreviewPhoto = (url: string) => {
    Taro.previewImage({
      urls: sealedPhotos,
      current: url
    });
  };

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
    if (sealedPhotos.length === 0) {
      Taro.showToast({ title: '请先拍摄封箱照片', icon: 'none' });
      return;
    }

    const totalQty = instruments.reduce((sum, item) => sum + item.quantity, 0);
    const batchNo = generateBatchNo();
    const newOrder: Order = {
      id: `o_${Date.now()}`,
      orderNo: generateOrderNo(),
      clinicName: user.clinicName || '未绑定门诊',
      clinicId: user.id,
      instrumentCount: totalQty,
      instruments,
      status: 'sealed',
      sealedPhotos,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      batchNo,
      remark
    };

    addOrder(newOrder);
    console.info('[OrderCreate] Order sealed:', newOrder.orderNo, 'Photos:', sealedPhotos.length);

    Taro.showModal({
      title: '封箱成功',
      content: `订单 ${newOrder.orderNo} 已封箱，共 ${totalQty} 件器械，${sealedPhotos.length} 张封箱照片`,
      showCancel: false,
      success: () => {
        Taro.navigateBack();
      }
    });
  };

  const handleSaveDraft = () => {
    const totalQty = instruments.reduce((sum, item) => sum + item.quantity, 0);
    const newOrder: Order = {
      id: `o_${Date.now()}`,
      orderNo: generateOrderNo(),
      clinicName: user.clinicName || '未绑定门诊',
      clinicId: user.id,
      instrumentCount: totalQty,
      instruments,
      status: 'pending',
      sealedPhotos,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      remark
    };
    addOrder(newOrder);
    console.info('[OrderCreate] Draft saved:', newOrder.orderNo);
    Taro.showToast({ title: '已保存草稿', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
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
              <View className={styles.qtyControl}>
                <View
                  className={styles.qtyBtn}
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <Text className={styles.qtyBtnText}>-</Text>
                </View>
                <Text className={styles.instrumentQty}>{item.quantity}</Text>
                <View
                  className={styles.qtyBtn}
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Text className={styles.qtyBtnText}>+</Text>
                </View>
              </View>
              <View className={styles.removeBtn} onClick={() => handleRemoveInstrument(item.id)}>
                <Text>移除</Text>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.addBtn} onClick={handleAddInstrument}>
          <Text className={styles.addBtnText}>+ 添加器械</Text>
        </View>
        <View className={styles.totalRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalValue}>
            {instruments.reduce((sum, item) => sum + item.quantity, 0)} 件
          </Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionLabel}>拍照封箱</Text>
          <Text className={styles.photoCount}>{sealedPhotos.length}/9</Text>
        </View>
        <View className={styles.photoSection}>
          <View className={styles.photoGrid}>
            {sealedPhotos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image
                  className={styles.photoImg}
                  src={photo}
                  mode="aspectFill"
                  onClick={() => handlePreviewPhoto(photo)}
                  onError={(e) => {
                    console.error('[OrderCreate] Image load error:', e);
                  }}
                />
                <View
                  className={styles.photoRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(index);
                  }}
                >
                  <Text className={styles.photoRemoveText}>×</Text>
                </View>
              </View>
            ))}
            {sealedPhotos.length < 9 && (
              <View className={classnames(styles.photoItem, styles.photoAdd)} onClick={handleAddPhoto}>
                <Text className={styles.photoIcon}>📷</Text>
                <Text className={styles.photoAddText}>拍照</Text>
              </View>
            )}
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
        <View
          className={classnames(
            styles.btnPrimary,
            sealedPhotos.length === 0 && styles.btnDisabled
          )}
          onClick={handleSubmit}
        >
          <Text className={styles.btnPrimaryText}>确认封箱</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCreatePage;
