import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserSettings } from '@/hooks/use-user-settings';

export default function SettingsPreferencesScreen() {
  const { preferences, updatePreferences } = useUserSettings();

  const handleCurrencyChange = async (currency: 'USD' | 'EUR' | 'IDR') => {
    await updatePreferences({ currency });
  };

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    await updatePreferences({ theme });
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
        {/* Currency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <Text style={styles.sectionDescription}>Select your preferred currency</Text>

          {(['USD', 'EUR', 'IDR'] as const).map((currency) => (
            <Pressable
              key={currency}
              style={styles.option}
              onPress={() => handleCurrencyChange(currency)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>
                  {currency === 'USD' ? 'US Dollar' : currency === 'EUR' ? 'Euro' : 'Indonesian Rupiah'}
                </Text>
                <Text style={styles.optionValue}>
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Rp'}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  preferences.currency === currency && styles.radioSelected,
                ]}
              >
                {preferences.currency === currency && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.sectionDescription}>Choose your preferred theme</Text>

          {(['light', 'dark'] as const).map((theme) => (
            <Pressable
              key={theme}
              style={styles.option}
              onPress={() => handleThemeChange(theme)}
            >
              <View style={styles.optionContent}>
                <FontAwesome6
                  name={theme === 'light' ? 'sun' : 'moon'}
                  size={18}
                  color="#ff6f10"
                  style={styles.themeIcon}
                />
                <Text style={styles.optionLabel}>
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  preferences.theme === theme && styles.radioSelected,
                ]}
              >
                {preferences.theme === theme && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </Pressable>
          ))}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcon: {
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  optionValue: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#ff6f10',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6f10',
  },
});
