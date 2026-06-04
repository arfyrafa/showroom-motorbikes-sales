import { FontAwesome6 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBookings } from '@/hooks/use-bookings';
import { useMotorcycles } from '@/hooks/use-motorcycles';

export default function ScheduleVisitScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const { addBooking } = useBookings();
  const { motorcycles } = useMotorcycles();
  
  const [visitDate, setVisitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const motorcycle = id ? motorcycles.find((m) => m.motorcycle_id === id) : null;

  const handleSubmit = async () => {
    if (!id) return;
    if (!visitDate.trim()) {
      Alert.alert('Error', 'Harap masukkan rencana tanggal/hari kunjungan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dateString = notes ? `${visitDate} (Catatan: ${notes})` : visitDate;
      await addBooking(id, 'interested', dateString);
      
      Alert.alert('Berhasil', 'Jadwal kunjungan Anda telah disimpan. Admin akan segera menghubungi Anda.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan jadwal kunjungan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!motorcycle) {
    return (
      <View style={styles.container}>
        <Text>Motorcycle not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Jadwalkan Kunjungan</Text>
        <Text style={styles.subtitle}>Tertarik dengan {motorcycle.title}?</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Kapan Anda berencana datang?</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Senin depan jam 10 pagi, atau 12 Nov"
          placeholderTextColor="#999"
          value={visitDate}
          onChangeText={setVisitDate}
        />

        <Text style={styles.label}>Catatan Tambahan (opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Contoh: Tolong siapkan kunci untuk test drive"
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Simpan Jadwal</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#ff6f10',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffe0ca',
  },
  form: {
    padding: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#ff6f10',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
