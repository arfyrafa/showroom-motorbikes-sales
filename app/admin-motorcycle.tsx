import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useAuth } from '@/lib/auth-context';

export default function AdminMotorcycleScreen() {
  const { createMotorcycleByAdmin } = useMotorcycles();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState(`${new Date().getFullYear()}`);
  const [engineCapacity, setEngineCapacity] = useState('');
  const [mileage, setMileage] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageType, setImageType] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gate: hanya admin yang bisa akses
  useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', 'Hanya admin yang bisa akses halaman ini.');
      router.back();
    }
  }, [user]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Kasih izin galeri dulu untuk upload gambar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageType(result.assets[0].mimeType);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !location || !year || !engineCapacity || !mileage || !imageUri) {
      Alert.alert('Data belum lengkap', 'Semua field wajib diisi termasuk gambar motor.');
      return;
    }

    const parsedPrice = Number(price.replace(/[^0-9.]/g, ''));
    const parsedYear = Number(year);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Harga tidak valid', 'Masukkan angka harga yang benar.');
      return;
    }

    if (!Number.isFinite(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      Alert.alert('Tahun tidak valid', 'Masukkan tahun antara 1900 sampai 2100.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMotorcycleByAdmin({
        title,
        price: parsedPrice,
        location,
        year: parsedYear,
        engineCapacity,
        mileage,
        description,
        imageUri,
        mimeType: imageType,
      });

      Alert.alert('Berhasil', 'Motor berhasil ditambahkan oleh admin.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/explore') },
      ]);
    } catch (error: any) {
      Alert.alert('Gagal simpan', error?.message ?? 'Terjadi kesalahan saat upload motor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#1a1a1a" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Admin Input Motor</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Judul Motor</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Yamaha NMAX 2024"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Harga (IDR)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Contoh: 32000000"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Lokasi</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Contoh: Jakarta Selatan"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Tahun</Text>
        <TextInput
          style={styles.input}
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          placeholder="Contoh: 2024"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Kapasitas Mesin</Text>
        <TextInput
          style={styles.input}
          value={engineCapacity}
          onChangeText={setEngineCapacity}
          placeholder="Contoh: 155cc"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Mileage</Text>
        <TextInput
          style={styles.input}
          value={mileage}
          onChangeText={setMileage}
          placeholder="Contoh: 1.200 km"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Deskripsi motor"
          placeholderTextColor="#999"
          multiline
        />

        <Text style={styles.label}>Gambar Motor</Text>
        <Pressable style={styles.uploadButton} onPress={handlePickImage}>
          <FontAwesome6 name="image" size={16} color="#fff" />
          <Text style={styles.uploadButtonText}>Pilih Gambar dari Galeri</Text>
        </Pressable>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
        ) : null}

        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Motor'}
          </Text>
        </Pressable>
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
    gap: 8,
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  uploadButton: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1f7a4d',
    borderRadius: 10,
    paddingVertical: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  previewImage: {
    marginTop: 12,
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  submitButton: {
    marginTop: 18,
    backgroundColor: '#ff6f10',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
