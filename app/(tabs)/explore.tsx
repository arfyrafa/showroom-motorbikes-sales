import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MotorcycleCard } from '@/components/motorcycle-card';
import { useMotorcycles } from '@/hooks/use-motorcycles';

export default function TabTwoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { motorcycles, isLoading, error, refresh } = useMotorcycles();

  const filteredMotorcycles = useMemo(() => {
    return motorcycles.filter((motorcycle) =>
      motorcycle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motorcycle.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [motorcycles, searchQuery]);

  const handleMotorcyclePress = (motorcycle_id: string) => {
    router.push({
      pathname: '/motorcycle-detail',
      params: { id: motorcycle_id },
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>MotoMarket</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome6 name="magnifying-glass" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search motorcycles..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters Button */}
        <View style={styles.filtersRow}>
          <Pressable style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <FontAwesome6 name="bars" size={14} color="#fff" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </Pressable>
        </View>

        {/* Count */}
        <Text style={styles.countText}>
          {filteredMotorcycles.length} motorcycle{filteredMotorcycles.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Motorcycle List */}
      <FlatList
        data={filteredMotorcycles}
        keyExtractor={(item) => item.motorcycle_id}
        renderItem={({ item }) => (
          <MotorcycleCard
            motorcycle={item}
            onPress={() => handleMotorcyclePress(item.motorcycle_id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading && !error}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading && !error ? (
              <ActivityIndicator size="large" color="#ff6f10" />
            ) : error ? (
              <>
                <FontAwesome6 name="triangle-exclamation" size={48} color="#F44336" />
                <Text style={styles.emptyTitle}>Database Connection Error</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <Text style={styles.debugText}>
                  {`Pastikan table 'motorcycles' sudah dibuat di Supabase dan RLS policies mengizinkan SELECT`}
                </Text>
                <Pressable style={styles.retryButton} onPress={refresh}>
                  <FontAwesome6 name="rotate" size={16} color="#fff" />
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </>
            ) : (
              <>
                <FontAwesome6 name="motorcycle" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Belum ada motor tersedia</Text>
              </>
            )}
          </View>
        }
        scrollEnabled
        nestedScrollEnabled
      />
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6f10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  countText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6f10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
