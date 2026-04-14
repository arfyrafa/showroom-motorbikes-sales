import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.glow} />

      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image source={require('@/assets/images/motosales.jpeg')} style={styles.logo} contentFit="contain" />
        </View>

        <Text style={styles.title}>MotoMarket</Text>
        <Text style={styles.subtitle}>Your Premium Motorcycle Marketplace</Text>

        <Pressable style={styles.ctaButton} onPress={() => router.push('/login')}>
          <Text style={styles.ctaText}>Find Your Dream Ride</Text>
        </Pressable>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ff5b00',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  glow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#ff6f1a',
    opacity: 0.45,
    bottom: -130,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#ea7c42',
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 34,
    alignItems: 'center',
    shadowColor: '#9f2d00',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 12,
  },
  logoWrap: {
    height: 180,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 190,
    height: 110,
  },
  title: {
    fontSize: 46,
    fontWeight: '800',
    color: '#f6c55f',
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 8,
    color: '#ffe2c7',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  ctaButton: {
    marginTop: 100,
    backgroundColor: '#d84a00',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: '#fff6eb',
    fontSize: 16,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#d95816',
  },
  dotActive: {
    backgroundColor: '#b93a00',
  },
});
