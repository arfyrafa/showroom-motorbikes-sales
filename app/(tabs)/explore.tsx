import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MotorcycleCard } from '@/components/motorcycle-card';
import { MOTORCYCLES } from '@/constants/motorcycles';

export default function TabTwoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMotorcycles = useMemo(() => {
    return MOTORCYCLES.filter((motorcycle) =>
      motorcycle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motorcycle.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleMotorcyclePress = (id: string) => {
    router.push({
      pathname: '/motorcycle-detail',
      params: { id },
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MotorcycleCard
            motorcycle={item}
            onPress={() => handleMotorcyclePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
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
});
