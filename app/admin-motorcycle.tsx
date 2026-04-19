import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import type { MotorcycleListingStatus } from '@/constants/motorcycles';

export default function AdminMotorcycleScreen() {
  const {
    createMotorcycleByAdmin,
    motorcycles,
    isLoading: catalogLoading,
    updateMotorcycleListingStatus,
  } = useMotorcycles();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageType, setImageType] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingListingId, setUpdatingListingId] = useState<string | null>(null);

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
    if (!title || !price || !imageUri) {
      Alert.alert('Data belum lengkap', 'Semua field wajib diisi termasuk gambar motor.');
      return;
    }

    const parsedPrice = Number(price.replace(/[^0-9.]/g, ''));

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Harga tidak valid', 'Masukkan angka harga yang benar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMotorcycleByAdmin({
        title,
        price: parsedPrice,
        brand: brand || undefined,
        description,
        imageUri,
        mimeType: imageType,
      });

      Alert.alert('Berhasil', 'Motor berhasil ditambahkan oleh admin.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/explore') },
      ]);
    } catch (error: any) {
      const message = error?.message ?? 'Terjadi kesalahan saat upload motor.';
      const raw = (() => {
        try {
          return JSON.stringify(error);
        } catch {
          return String(error);
        }
      })();
      const detail = `${message}\n\nRaw: ${raw}`.slice(0, 1600);
      console.error('❌ Admin create motorcycle error:', error);
      Alert.alert('Gagal simpan', detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleListingStatus = async (
    motorcycleId: string,
    status: MotorcycleListingStatus
  ) => {
    setUpdatingListingId(motorcycleId);
    try {
      await updateMotorcycleListingStatus(motorcycleId, status);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Gagal memperbarui status', message);
    } finally {
      setUpdatingListingId(null);
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

        <Text style={styles.label}>Brand (opsional)</Text>
        <TextInput
          style={styles.input}
          value={brand}
          onChangeText={setBrand}
          placeholder="Contoh: Yamaha"
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

        <Text style={styles.sectionHeading}>Kelola ketersediaan</Text>
        <Text style={styles.sectionHint}>
          Tandai motor yang masih dijual (Available) atau sudah tidak dijual (Sold out).
        </Text>

        {catalogLoading ? (
          <ActivityIndicator style={styles.catalogSpinner} color="#ff6f10" />
        ) : motorcycles.length === 0 ? (
          <Text style={styles.emptyCatalog}>Belum ada motor di katalog.</Text>
        ) : (
          motorcycles.map((m) => {
            const current = m.listingStatus === 'sold_out' ? 'sold_out' : 'available';
            const busy = updatingListingId === m.motorcycle_id;
            return (
              <View key={m.motorcycle_id} style={styles.manageCard}>
                <Text style={styles.manageTitle} numberOfLines={2}>
                  {m.title}
                </Text>
                <Text style={styles.manageMeta}>
                  Status:{' '}
                  <Text style={styles.manageMetaStrong}>
                    {current === 'sold_out' ? 'Sold out' : 'Tersedia'}
                  </Text>
                </Text>
                <View style={styles.statusRow}>
                  <Pressable
                    style={[
                      styles.statusChip,
                      current === 'available' && styles.statusChipActive,
                      busy && styles.statusChipDisabled,
                    ]}
                    onPress={() => handleListingStatus(m.motorcycle_id, 'available')}
                    disabled={busy || current === 'available'}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        current === 'available' && styles.statusChipTextActive,
                      ]}
                    >
                      Available
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.statusChip,
                      current === 'sold_out' && styles.statusChipSoldOut,
                      busy && styles.statusChipDisabled,
                    ]}
                    onPress={() => handleListingStatus(m.motorcycle_id, 'sold_out')}
                    disabled={busy || current === 'sold_out'}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        current === 'sold_out' && styles.statusChipTextActive,
                      ]}
                    >
                      Sold out
                    </Text>
                  </Pressable>
                </View>
                {busy ? (
                  <ActivityIndicator style={styles.rowSpinner} size="small" color="#ff6f10" />
                ) : null}
              </View>
            );
          })
        )}
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
  sectionHeading: {
    marginTop: 28,
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  sectionHint: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  catalogSpinner: {
    marginVertical: 20,
  },
  emptyCatalog: {
    fontSize: 14,
    color: '#888',
    marginVertical: 12,
  },
  manageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 14,
    marginBottom: 12,
  },
  manageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  manageMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  manageMetaStrong: {
    fontWeight: '800',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  statusChipActive: {
    borderColor: '#1f7a4d',
    backgroundColor: '#e8f5e9',
  },
  statusChipSoldOut: {
    borderColor: '#c62828',
    backgroundColor: '#ffebee',
  },
  statusChipDisabled: {
    opacity: 0.55,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  statusChipTextActive: {
    color: '#1a1a1a',
  },
  rowSpinner: {
    marginTop: 8,
  },
});
