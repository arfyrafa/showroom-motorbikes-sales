import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MotorcycleCard } from '@/components/motorcycle-card';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { Skeleton } from '@/components/skeleton';

export default function TabTwoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { motorcycles, isLoading, error, refresh } = useMotorcycles();

  const categories = ['All', 'Sport', 'Scooter', 'Adventure', 'Electric'];

  const filteredMotorcycles = useMemo(() => {
    return motorcycles.filter((motorcycle) => {
      if (motorcycle.listingStatus === 'sold_out') return false;

      const matchesSearch = 
        motorcycle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        motorcycle.engineCapacity.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        motorcycle.engineCapacity.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [motorcycles, searchQuery, selectedCategory]);

  const handleMotorcyclePress = (motorcycle_id: string) => {
    router.push({
      pathname: '/motorcycle-detail',
      params: { id: motorcycle_id },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome6 name="magnifying-glass" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search motorcycles or brands..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Horizontal Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Motorcycle List */}
      {isLoading && filteredMotorcycles.length === 0 ? (
        <View style={styles.listContent}>
          <Skeleton width="100%" height={200} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={200} borderRadius={16} style={{ marginBottom: 16 }} />
        </View>
      ) : (
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
              {error ? (
                <>
                  <FontAwesome6 name="triangle-exclamation" size={48} color="#F44336" />
                  <Text style={styles.emptyTitle}>Connection Error</Text>
                  <Text style={styles.emptyText}>{error}</Text>
                  <Pressable style={styles.retryButton} onPress={refresh}>
                    <FontAwesome6 name="rotate" size={16} color="#fff" />
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <FontAwesome6 name="motorcycle" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No motorcycles found</Text>
                </>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryChipActive: {
    backgroundColor: '#ff6f10',
    borderColor: '#ff6f10',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
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
    marginTop: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6f10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
