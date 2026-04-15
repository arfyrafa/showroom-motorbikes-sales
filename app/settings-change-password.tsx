import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.title}>Change Password</Text>

        <View style={styles.formSection}>
          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your current password"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#ccc"
            />
            <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <FontAwesome6
                name={showCurrentPassword ? 'eye-slash' : 'eye'}
                size={18}
                color="#999"
              />
            </Pressable>
          </View>

          {/* New Password */}
          <Text style={styles.label}>Create New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter a new password"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#ccc"
            />
            <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
              <FontAwesome6
                name={showNewPassword ? 'eye-slash' : 'eye'}
                size={18}
                color="#999"
              />
            </Pressable>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsLabel}>Must be at least 8 characters</Text>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your new password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#ccc"
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <FontAwesome6
                name={showConfirmPassword ? 'eye-slash' : 'eye'}
                size={18}
                color="#999"
              />
            </Pressable>
          </View>

          {/* Change Password Button */}
          <Pressable
            style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? 'UPDATING...' : 'CHANGE PASSWORD'}
            </Text>
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },
  requirementsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  requirementsLabel: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: '#ff6f10',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
