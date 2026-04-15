import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MotorcycleCard } from '@/components/motorcycle-card';
import { useBookings } from '@/hooks/use-bookings';

export default function HistoryScreen() {
  const { bookings, isLoading } = useBookings();

  // Get unique motorcycles that user is interested in
  const interestedMotorcycles = bookings
    .filter((b) => b.type === 'interested')
    .reduce(
      (acc, booking) => {
        const exists = acc.find((m) => m.id === booking.motorcycle.id);
        if (!exists) {
          acc.push(booking.motorcycle);
        }
        return acc;
      },
      [] as typeof bookings[0]['motorcycle'][]
    );

  const handleMotorcyclePress = (id: string) => {
    router.push({
      pathname: '/motorcycle-detail',
      params: { id },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Booking History</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking History</Text>
      </View>

      {interestedMotorcycles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name="bookmark" size={48} color="#ddd" />
          </View>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't expressed interest in any motorcycles yet.
          </Text>

          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.browseButtonText}>Browse Motorcycles</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={interestedMotorcycles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MotorcycleCard
              motorcycle={item}
              onPress={() => handleMotorcyclePress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled
          ListHeaderComponent={
            <Text style={styles.countText}>
              {interestedMotorcycles.length} motorcycle
              {interestedMotorcycles.length !== 1 ? 's' : ''} saved
            </Text>
          }
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: '#ff6f10',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  countText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
