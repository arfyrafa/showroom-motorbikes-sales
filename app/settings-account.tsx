import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserSettings } from '@/hooks/use-user-settings';

export default function SettingsAccountScreen() {
  const { clearAllSettings } = useUserSettings();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          // Navigate to login
          router.replace('/login');
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    router.push('/settings-change-password');
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Permanently delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await clearAllSettings();
          Alert.alert('Account deleted', 'Your account has been deleted successfully');
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={24} color="#1a1a1a" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Management Title */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Management</Text>
            <Pressable>
              <Text style={styles.closeLink}>Close</Text>
            </Pressable>
          </View>
        </View>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          {/* Logout */}
          <Pressable style={styles.option} onPress={handleLogout}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="power-off" size={18} color="#F44336" />
              </View>
              <View>
                <Text style={styles.optionLabel}>Logout</Text>
                <Text style={styles.optionDescription}>Sign out from your account</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={18} color="#ddd" />
          </Pressable>

          {/* Change Password */}
          <Pressable style={styles.option} onPress={handleChangePassword}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="key" size={18} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.optionLabel}>Change Password</Text>
                <Text style={styles.optionDescription}>Update your password securely</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={18} color="#ddd" />
          </Pressable>

          {/* Delete Account */}
          <Pressable style={styles.option} onPress={handleDeleteAccount}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="trash" size={18} color="#F44336" />
              </View>
              <View>
                <Text style={[styles.optionLabel, styles.dangerText]}>Delete Account</Text>
                <Text style={styles.optionDescription}>Permanently delete your account</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={18} color="#ddd" />
          </Pressable>
        </View>
      </ScrollView>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeLink: {
    fontSize: 13,
    color: '#ff6f10',
    fontWeight: '600',
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
  },
  dangerText: {
    color: '#F44336',
  },
});
