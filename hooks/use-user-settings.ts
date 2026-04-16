import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export interface UserPreferences {
  currency: 'USD' | 'EUR' | 'IDR';
  theme: 'light' | 'dark';
}

export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
}

const PROFILE_STORAGE_KEY = '@motomarket_profile';
const PREFERENCES_STORAGE_KEY = '@motomarket_preferences';

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  mobile: '+1 234 567 8900',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'IDR',
  theme: 'light',
};

export function useUserSettings() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const [storedProfile, storedPreferences] = await Promise.all([
        AsyncStorage.getItem(PROFILE_STORAGE_KEY),
        AsyncStorage.getItem(PREFERENCES_STORAGE_KEY),
      ]);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (updatedProfile: Partial<UserProfile>) => {
      try {
        const newProfile = { ...profile, ...updatedProfile };
        setProfile(newProfile);
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        return false;
      }
    },
    [profile]
  );

  const updatePreferences = useCallback(
    async (updatedPreferences: Partial<UserPreferences>) => {
      try {
        const newPreferences = { ...preferences, ...updatedPreferences };
        setPreferences(newPreferences);
        await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPreferences));
        return true;
      } catch (error) {
        console.error('Error updating preferences:', error);
        return false;
      }
    },
    [preferences]
  );

  const clearAllSettings = useCallback(async () => {
    try {
      setProfile(DEFAULT_PROFILE);
      setPreferences(DEFAULT_PREFERENCES);
      await Promise.all([
        AsyncStorage.removeItem(PROFILE_STORAGE_KEY),
        AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  }, []);

  return {
    profile,
    preferences,
    isLoading,
    updateProfile,
    updatePreferences,
    clearAllSettings,
  };
}
