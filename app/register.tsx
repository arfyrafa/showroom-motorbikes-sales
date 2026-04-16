import { useAuth } from '@/lib/auth-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak sama');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Email tidak valid');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name);
      // Auto login setelah register
    } catch (error) {
      Alert.alert('Signup Gagal', error instanceof Error ? error.message : 'Terjadi kesalahan');
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
          <Text style={styles.subtitle}>Create Account</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.inputRow}>
            <View style={styles.iconBadge}>
              <FontAwesome6 name="user" size={14} color="#8b95a5" />
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              placeholderTextColor="#9aa3af"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.iconBadge}>
              <FontAwesome6 name="envelope" size={14} color="#8b95a5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9aa3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.iconBadge}>
              <FontAwesome6 name="lock" size={14} color="#8b95a5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 chars)"
              placeholderTextColor="#9aa3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.iconBadge}>
              <FontAwesome6 name="lock" size={14} color="#8b95a5" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#9aa3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
          </View>

          <Pressable 
            style={[styles.primaryButton, isLoading && { opacity: 0.6 }]} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Link href="/login" style={styles.linkText}>
              Sign In
            </Link>
          </Text>
        </View>
      </View>

      <Text style={styles.demoText}>Demo: Bisa bikin akun baru atau gunakan:
{'\n'}admin@showroom.com / admin123
{'\n'}user@showroom.com / user123</Text>
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
    paddingTop: 24,
    paddingBottom: 18,
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
    marginTop: 2,
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    backgroundColor: '#f2f2f2',
    padding: 20,
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
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 16,
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
    marginTop: 16,
    color: '#ffe9d7',
    fontSize: 15,
    fontWeight: '500',
  },
});
