import { useAuth } from '@/lib/auth-context';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useBanners } from '@/hooks/use-banners';
import { FontAwesome6 } from '@expo/vector-icons';
import { shareMotorcycle } from '@/lib/share';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/skeleton';

import { WebAdminDashboard } from '@/components/web-admin-dashboard';

export default function HomeScreen() {
  const { user } = useAuth();
  const { motorcycles, isLoading } = useMotorcycles();
  const { banners, isLoading: isBannersLoading } = useBanners(true);
  
  const screenWidth = Dimensions.get('window').width;

  const availableMotorcycles = motorcycles.filter((m) => m.listingStatus !== 'sold_out');
  const featuredMotors = availableMotorcycles.slice(0, 3);
  const recentArrivals = availableMotorcycles.slice(3, 7);

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.featuredCard}
      onPress={() =>
        router.push({
          pathname: '/motorcycle-detail',
          params: { id: item.motorcycle_id },
        })
      }
    >
      <Image source={item.image} style={styles.featuredImage} contentFit="cover" />
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredPrice}>
          {item.price.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          })}
        </Text>
      </View>
    </Pressable>
  );

  const isAdmin = user?.role === 'admin';

  if (isAdmin && Platform.OS === 'web') {
    return <WebAdminDashboard />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Shared Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {isAdmin ? 'Admin Portal' : `Hello, ${user?.name?.split(' ')[0] || 'User'}`}
          </Text>
          <Text style={styles.headerTitle}>
            {isAdmin ? 'Management System' : 'Find your dream ride'}
          </Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push('/(tabs)/settings')}>
          <FontAwesome6 name={isAdmin ? 'gear' : 'bell'} size={20} color="#1a1a1a" />
        </Pressable>
      </View>

      {isAdmin && Platform.OS !== 'web' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <FontAwesome6 name="desktop" size={60} color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 }}>
            Web Version Required
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>
            The Admin dashboard is optimized for desktop and only available on the web version. Please access this system from a desktop browser to manage inventory and leads.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          {isBannersLoading ? (
            <View style={styles.heroContainer}>
              <Skeleton width="100%" height={160} borderRadius={20} />
            </View>
          ) : banners.length > 0 ? (
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 20, marginBottom: 10 }}
            >
              {banners.map((banner) => (
                <View key={banner.id} style={[styles.heroContainer, { margin: 0, marginHorizontal: 20, width: screenWidth - 40 }]}>
                  <Image source={{ uri: banner.image_url }} style={styles.heroBgImage} contentFit="cover" />
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>{banner.title}</Text>
                    {banner.subtitle && <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>}
                    <Pressable 
                      style={styles.heroButton} 
                      onPress={() => router.push(banner.action_link ? (banner.action_link as any) : '/(tabs)/explore')}
                    >
                      <Text style={styles.heroButtonText}>Check Now</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.heroContainer}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>New Season{"\n"}Special Offers</Text>
                <Text style={styles.heroSubtitle}>Get up to 10% cashback for every purchase this month.</Text>
                <Pressable style={styles.heroButton} onPress={() => router.push('/(tabs)/explore')}>
                  <Text style={styles.heroButtonText}>Check Now</Text>
                </Pressable>
              </View>
              <Image 
                source="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400" 
                style={styles.heroImage} 
                contentFit="cover" 
              />
            </View>
          )}

          {/* Featured Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Motorcycles</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            
            {isLoading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
                <Skeleton width={240} height={160} borderRadius={16} style={{ marginRight: 15 }} />
                <Skeleton width={240} height={160} borderRadius={16} style={{ marginRight: 15 }} />
              </ScrollView>
            ) : (
              <FlatList
                data={featuredMotors}
                renderItem={renderFeaturedItem}
                keyExtractor={(item) => item.motorcycle_id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              />
            )}
          </View>

          {/* Categories / Quick Links */}
          <View style={styles.categories}>
            <QuickLink icon="motorcycle" label="Sport" color="#FF3B30" />
            <QuickLink icon="moped" label="Scooter" color="#007AFF" />
            <QuickLink icon="mountain-sun" label="Adventure" color="#34C759" />
            <QuickLink icon="gauge-high" label="Electric" color="#5856D6" />
          </View>

          {/* Recent Arrivals */}
          <View style={[styles.section, styles.bottomSection]}>
            <Text style={styles.sectionTitle}>Recent Arrivals</Text>
            {isLoading ? (
              <View style={{ marginTop: 12 }}>
                <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
              </View>
            ) : (
              recentArrivals.map((motor) => (
                <Pressable 
                  key={motor.motorcycle_id} 
                  style={styles.recentCard}
                  onPress={() => router.push({
                    pathname: '/motorcycle-detail',
                    params: { id: motor.motorcycle_id }
                  })}
                >
                  <Image source={motor.image} style={styles.recentImage} contentFit="cover" />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>{motor.title}</Text>
                    <Text style={styles.recentBrand}>{motor.engineCapacity}</Text>
                    {motor.createdAt && (
                      <Text style={[styles.recentBrand, { fontSize: 10, color: '#aaa', marginTop: 1 }]}>
                        Masuk: {new Date(motor.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    )}
                    <Text style={styles.recentPrice}>
                      {motor.price.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      shareMotorcycle(motor);
                    }}
                    style={({ pressed }) => [
                      styles.shareIconButton,
                      pressed && styles.shareIconButtonPressed,
                    ]}
                  >
                    <FontAwesome6 name="share-nodes" size={14} color="#666" />
                  </Pressable>
                  <FontAwesome6 name="chevron-right" size={14} color="#ccc" style={{ marginLeft: 6 }} />
                </Pressable>
              ))
            )}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function QuickLink({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: color + '15' }]}>
        <FontAwesome6 name={icon} size={20} color={color} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    margin: 20,
    height: 160,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  heroContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  heroSubtitle: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 15,
  },
  heroButton: {
    backgroundColor: '#ff6f10',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroImage: {
    position: 'absolute',
    right: -20,
    top: 0,
    bottom: 0,
    width: '60%',
    opacity: 0.6,
  },
  heroBgImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 14,
    color: '#ff6f10',
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  featuredList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  featuredCard: {
    width: 240,
    height: 160,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuredPrice: {
    color: '#ff6f10',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  bottomSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  recentBrand: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6f10',
    marginTop: 4,
  },
  shareIconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIconButtonPressed: {
    backgroundColor: '#e5e5e5',
    opacity: 0.8,
  },
});
