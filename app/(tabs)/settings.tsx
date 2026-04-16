import { useAuth } from '@/lib/auth-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah kamu yakin ingin logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              // Auth state change akan trigger redirect di _layout via useEffect
            } catch (error) {
              Alert.alert('Error', 'Logout gagal');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      description: 'Manage your personal information',
      icon: 'user' as const,
      color: '#FF9500',
      route: '/settings-profile',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      description: 'Set up your currency and theme',
      icon: 'sliders' as const,
      color: '#9C27B0',
      route: '/settings-preferences',
    },
    {
      id: 'account',
      label: 'Account',
      description: 'Logout and account management',
      icon: 'shield' as const,
      color: '#F44336',
      route: '/settings-account',
    },
    ...(user?.role === 'admin'
      ? [
          {
            id: 'admin-motor',
            label: 'Admin Motor',
            description: 'Input motor baru dan upload gambar',
            icon: 'motorcycle' as const,
            color: '#1F7A4D',
            route: '/admin-motorcycle',
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.useravatar}>
          <FontAwesome6 name="user-circle" size={48} color="#1F7A4D" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#1F7A4D' : '#007AFF' }]}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <FontAwesome6 name={item.icon} size={24} color={item.color} />
            </View>

            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>

            <FontAwesome6 name="chevron-right" size={20} color="#ddd" />
          </Pressable>
        ))}

        {/* Logout Button */}
        <Pressable style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <View style={[styles.iconContainer, { backgroundColor: '#F4433620' }]}>
            <FontAwesome6 name="sign-out" size={24} color="#F44336" />
          </View>

          <View style={styles.menuItemContent}>
            <Text style={[styles.menuItemLabel, { color: '#F44336' }]}>Logout</Text>
            <Text style={styles.menuItemDescription}>Sign out dari akun Anda</Text>
          </View>

          <FontAwesome6 name="chevron-right" size={20} color="#ddd" />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.appVersion}>MotoMarket Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 MotoMarket. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  useravatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoutButton: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 11,
    color: '#999',
  },
});
