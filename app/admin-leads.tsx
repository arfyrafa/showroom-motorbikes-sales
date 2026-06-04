import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

type LeadRecord = {
  booking_id: string;
  interaction_type: string;
  created_at: string;
  visit_date: string | null;
  motorcycles: {
    name: string;
    price: number;
  };
  profiles: {
    name: string;
    email: string;
  } | null;
};

export default function AdminLeadsScreen() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gate: hanya admin yang bisa akses
  useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', 'Hanya admin yang bisa akses halaman ini.');
      router.back();
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings (only interested) + motorcycles
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('motorcycle_bookings')
        .select(`
          booking_id,
          interaction_type,
          created_at,
          visit_date,
          user_id,
          motorcycles ( name, price )
        `)
        .eq('interaction_type', 'interested')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch profiles manually to join
      const userIds = [...new Set((bookingsData || []).map((b: any) => b.user_id).filter(Boolean))];
      
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, email')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p;
          });
        }
      }

      // Map everything
      const mappedLeads: LeadRecord[] = (bookingsData || []).map((b: any) => ({
        booking_id: b.booking_id,
        interaction_type: b.interaction_type,
        created_at: b.created_at,
        visit_date: b.visit_date,
        motorcycles: b.motorcycles,
        profiles: profilesMap[b.user_id] 
          ? { name: profilesMap[b.user_id].first_name || 'No Name', email: profilesMap[b.user_id].email } 
          : { name: 'Unknown', email: '-' }
      }));

      setLeads(mappedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Gagal mengambil data leads.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: LeadRecord }) => {
    const formattedPrice = item.motorcycles?.price?.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }) || 'Rp -';

    const dateStr = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome6 name="user" size={16} color="#666" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.profiles?.name}</Text>
            <Text style={styles.userEmail}>{item.profiles?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.motorInfo}>
          <Text style={styles.motorName}>{item.motorcycles?.name}</Text>
          <Text style={styles.motorPrice}>{formattedPrice}</Text>
        </View>

        {item.visit_date && (
          <View style={styles.visitDateContainer}>
            <FontAwesome6 name="calendar-check" size={14} color="#1F7A4D" />
            <Text style={styles.visitDateText}>Jadwal: {item.visit_date}</Text>
          </View>
        )}

        <Text style={styles.timestamp}>Masuk pada: {dateStr}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#1a1a1a" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Daftar Leads / Peminat</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#ff6f10" />
      ) : leads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="inbox" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Belum ada peminat</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.booking_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  motorInfo: {
    marginBottom: 8,
  },
  motorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f7a4d',
  },
  motorPrice: {
    fontSize: 14,
    color: '#ff6f10',
    fontWeight: '600',
    marginTop: 2,
  },
  visitDateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  visitDateText: {
    flex: 1,
    fontSize: 13,
    color: '#1f7a4d',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 12,
    textAlign: 'right',
  },
});
