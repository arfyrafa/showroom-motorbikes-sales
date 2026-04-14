import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>MotoMarket</Text>
        <Text style={styles.subtitle}>Welcome back, ready to find your dream bike?</Text>

        <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.primaryButtonText}>Browse Marketplace</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff3ea',
    justifyContent: 'center',
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#ff6f10',
    borderRadius: 18,
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 10,
    color: '#ffe0ca',
    fontSize: 16,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ff6f10',
    fontSize: 16,
    fontWeight: '700',
  },
});
