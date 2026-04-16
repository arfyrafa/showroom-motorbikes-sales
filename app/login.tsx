import { useAuth } from '@/lib/auth-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigasi otomatis via useEffect di app layout
    } catch (error) {
      Alert.alert('Login Gagal', error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image source={require('@/assets/images/motosales.jpeg')} style={styles.logo} contentFit="contain" />
          </View>

          <Text style={styles.title}>MotoMarket</Text>
          <Text style={styles.subtitle}>Your Premium Motorcycle Marketplace</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputRow}>
            <View style={styles.iconBadge}>
              <FontAwesome6 name="envelope" size={14} color="#8b95a5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#9aa3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <View style={styles.iconBadge}>
              <FontAwesome6 name="lock" size={14} color="#8b95a5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9aa3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          <Pressable 
            style={[styles.primaryButton, isLoading && { opacity: 0.6 }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            Demo users available - no register yet{' '}
          </Text>
        </View>
      </View>

      <Text style={styles.demoText}>Demo:{'\n'}admin@showroom.com / admin123{'\n'}user@showroom.com / user123</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ff5b00',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ff6f10',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 42,
    height: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    color: '#ffe7d1',
    fontSize: 15,
    textAlign: 'center',
  },
  body: {
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4c5563',
    marginBottom: 8,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7ced8',
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 14,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#d7dde6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222a36',
  },
  primaryButton: {
    backgroundColor: '#ff6f10',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#637081',
    fontSize: 15,
  },
  linkText: {
    color: '#ff6f10',
    fontWeight: '700',
    fontSize: 15,
  },
  demoText: {
    textAlign: 'center',
    marginTop: 18,
    color: '#ffe9d7',
    fontSize: 15,
    fontWeight: '500',
  },
});
