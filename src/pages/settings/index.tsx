import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const SettingsPage: React.FC = () => {
  const { user } = useAppStore();

  const handleNotification = () => {
    Taro.showToast({ title: '通知设置功能开发中', icon: 'none' });
  };

  const handleAbout = () => {
    Taro.showToast({ title: '关于功能开发中', icon: 'none' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          console.info('[Settings] User logged out');
          Taro.reLaunch({ url: '/pages/workspace/index' });
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionLabel}>账号信息</Text>
        <View className={styles.menuGroup}>
          <View className={styles.menuItem}>
            <Text className={styles.menuTitle}>姓名</Text>
            <Text className={styles.menuValue}>{user.name}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <Text className={styles.menuTitle}>手机号</Text>
            <Text className={styles.menuValue}>{user.phone}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <Text className={styles.menuTitle}>所属机构</Text>
            <Text className={styles.menuValue}>{user.clinicName || '未绑定'}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionLabel}>通用</Text>
        <View className={styles.menuGroup}>
          <View className={styles.menuItem} onClick={handleNotification}>
            <Text className={styles.menuTitle}>消息通知</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleAbout}>
            <Text className={styles.menuTitle}>关于</Text>
            <Text className={styles.menuValue}>v1.0.0</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.logoutBtn} onClick={handleLogout}>
        <Text className={styles.logoutText}>退出登录</Text>
      </View>

      <View className={styles.versionInfo}>
        <Text className={styles.versionText}>齿科消供通 v1.0.0</Text>
      </View>
    </View>
  );
};

export default SettingsPage;
