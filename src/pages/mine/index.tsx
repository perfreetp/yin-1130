import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { user, currentRole, setRole } = useAppStore();

  const handleSwitchRole = () => {
    const newRole = currentRole === 'clinic' ? 'center' : 'clinic';
    setRole(newRole);
    Taro.showToast({
      title: newRole === 'clinic' ? '已切换到门诊端' : '已切换到供应中心端',
      icon: 'none'
    });
  };

  const handleReconciliation = () => {
    Taro.navigateTo({ url: '/pages/reconciliation/index' });
  };

  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  const handleMyPacks = () => {
    Taro.switchTab({ url: '/pages/trace/index' });
  };

  const handleNotifications = () => {
    Taro.showToast({ title: '消息通知功能开发中', icon: 'none' });
  };

  const handleHelp = () => {
    Taro.showToast({ title: '帮助中心功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>
          <Text>👤</Text>
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>{user.name}</Text>
          <Text className={styles.profileOrg}>
            {currentRole === 'clinic' ? user.clinicName : '区域口腔消毒供应中心'}
          </Text>
        </View>
        <View className={styles.roleSwitch} onClick={handleSwitchRole}>
          <Text className={styles.roleSwitchText}>
            切换{currentRole === 'clinic' ? '中心' : '门诊'}端
          </Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuGroup}>
          <View className={styles.menuItem} onClick={handleMyPacks}>
            <View className={styles.menuIcon}>
              <Text>📦</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的器械包</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleReconciliation}>
            <View className={styles.menuIcon}>
              <Text>📊</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>月度对账</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleNotifications}>
            <View className={styles.menuIcon}>
              <Text>🔔</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>消息通知</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.menuGroup}>
          <View className={styles.menuItem} onClick={handleHelp}>
            <View className={styles.menuIcon}>
              <Text>❓</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>帮助中心</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleSettings}>
            <View className={styles.menuIcon}>
              <Text>⚙️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>设置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.versionInfo}>
        <Text className={styles.versionText}>齿科消供通 v1.0.0</Text>
      </View>
    </View>
  );
};

export default MinePage;
