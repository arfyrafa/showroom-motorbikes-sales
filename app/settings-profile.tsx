import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserSettings } from '@/hooks/use-user-settings';

export default function SettingsProfileScreen() {
  const { profile, updateProfile } = useUserSettings();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [mobile, setMobile] = useState(profile.mobile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateProfile({
        firstName,
        lastName,
        email,
        mobile,
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating profile');
    } finally {
      setIsSaving(false);
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
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <FontAwesome6 name="user-circle" size={80} color="#ddd" />
            <Pressable style={styles.cameraButton}>
              <FontAwesome6 name="camera" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            placeholder="0888 8888 8888"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholderTextColor="#ccc"
          />

          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'SAVE'}
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
  },
  avatarSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff6f10',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#ff6f10',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
