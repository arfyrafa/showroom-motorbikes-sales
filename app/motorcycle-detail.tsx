import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/skeleton';
import { useBookings } from '@/hooks/use-bookings';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useAuth } from '@/lib/auth-context';
import { shareMotorcycle } from '@/lib/share';

const { width } = Dimensions.get('window');
export default function MotorcycleDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const { addBooking, bookings } = useBookings();
  const { motorcycles, isLoading } = useMotorcycles();
  const { user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const lastRecordedViewIdRef = useRef<string | null>(null);

  const motorcycle = id ? motorcycles.find((m) => m.motorcycle_id === id) : undefined;
  const isSoldOut = motorcycle?.listingStatus === 'sold_out';
  const isAdmin = user?.role === 'admin';
  const formattedPrice = motorcycle
    ? motorcycle.price.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    })
    : '';

  // Track view
  useEffect(() => {
    if (!id || !motorcycle) return;
    if (lastRecordedViewIdRef.current === id) return;
    lastRecordedViewIdRef.current = id;
    void addBooking(id, 'view');
  }, [id, motorcycle, addBooking]);

  useEffect(() => {
    if (motorcycle && bookings) {
      const interested = bookings.find(
        (b) => b.motorcycle_id === motorcycle.motorcycle_id && b.type === 'interested'
      );
      setIsInterested(!!interested);
    }
  }, [motorcycle, bookings]);

  const handleInterestedPress = async () => {
    if (id && motorcycle && !isSoldOut && !isInterested) {
      await addBooking(id, 'interested');
      setIsInterested(true);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
  };

  const handleWhatsAppPress = () => {
    if (!motorcycle) return;
    const waNumber = '6285721610319';
    const message = `Halo Admin MotoMarket, saya tertarik dengan motor ${motorcycle.title} (${formattedPrice}). Apakah unit ini masih tersedia?`;
    Linking.openURL(`whatsapp://send?phone=${waNumber}&text=${encodeURIComponent(message)}`);
    if (!isInterested) handleInterestedPress();
  };

  const handleSharePress = async () => {
    if (!motorcycle) return;
    await shareMotorcycle(motorcycle);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="chevron-left" size={24} color="#1a1a1a" />
          </Pressable>
        </View>
        <Skeleton width="100%" height={300} />
        <View style={styles.content}>
          <Skeleton width="70%" height={30} style={{ marginBottom: 10 }} />
          <Skeleton width="40%" height={35} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={100} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  if (!motorcycle) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="chevron-left" size={24} color="#1a1a1a" />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="circle-exclamation" size={60} color="#ddd" />
          <Text style={styles.errorText}>Motorcycle not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <FontAwesome6 name="chevron-left" size={18} color="#1a1a1a" />
          </Pressable>
          <Pressable onPress={handleSharePress} style={styles.iconButton}>
            <FontAwesome6 name="share-nodes" size={18} color="#1a1a1a" />
          </Pressable>
        </View>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: motorcycle.image }}
            style={[styles.image, isSoldOut && styles.imageDimmed]}
            contentFit="cover"
          />
          {isSoldOut && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>UNIT SOLD</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isSoldOut && !isAdmin && (
            <View style={styles.soldOutBanner}>
              <FontAwesome6 name="circle-info" size={16} color="#c62828" />
              <Text style={styles.soldOutBannerText}>
                Unit ini sudah terjual (Sold Out) dan tidak tersedia lagi di showroom.
              </Text>
            </View>
          )}
          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{motorcycle.title}</Text>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{motorcycle.year}</Text>
              </View>
            </View>
            <Text style={styles.price}>{formattedPrice}</Text>
          </View>

          {/* Key Specs Row */}
          <View style={styles.specRow}>
            <SpecItem icon="gauge-high" label="Engine" value={motorcycle.engineCapacity} />
            <SpecItem icon="road" label="Mileage" value={motorcycle.mileage} />
            <SpecItem icon="location-dot" label="Location" value="Jakarta" />
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{motorcycle.description || 'No description available for this unit.'}</Text>
          </View>

          {/* Specifications Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specTable}>
              <TableRow label="Brand" value={motorcycle.engineCapacity.split(' ')[0]} />
              <TableRow label="Model Year" value={motorcycle.year.toString()} />
              <TableRow label="Condition" value="Pre-owned" />
              <TableRow label="Listing Status" value={motorcycle.listingStatus === 'available' ? 'Available' : 'Sold'} />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.bottomBar}>
        {isSoldOut && !isAdmin ? (
          <View style={styles.disabledBottomBarBtn}>
            <FontAwesome6 name="ban" size={16} color="#999" style={{ marginRight: 8 }} />
            <Text style={styles.disabledBottomBarBtnText}>UNIT SOLD OUT / TERJUAL</Text>
          </View>
        ) : (
          <>
            <Pressable
              style={[styles.wishlistBtn, isInterested && styles.wishlistBtnActive]}
              onPress={handleInterestedPress}
            >
              <FontAwesome6 name="heart" size={20} color={isInterested ? '#fff' : '#ff6f10'} solid={isInterested} />
            </Pressable>
            <Pressable style={styles.waBtn} onPress={handleWhatsAppPress}>
              <FontAwesome6 name="whatsapp" size={20} color="#fff" />
              <Text style={styles.waBtnText}>Contact Seller</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.specItem}>
      <View style={styles.specIconBg}>
        <FontAwesome6 name={icon} size={14} color="#ff6f10" />
      </View>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableLabel}>{label}</Text>
      <Text style={styles.tableValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDimmed: {
    opacity: 0.6,
  },
  soldOutBadge: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  soldOutText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  mainInfo: {
    marginBottom: 25,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  yearBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff6f10',
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff5ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  specLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  specTable: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 15,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tableValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 35,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 15,
  },
  wishlistBtn: {
    width: 55,
    height: 55,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ff6f10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtnActive: {
    backgroundColor: '#ff6f10',
  },
  waBtn: {
    flex: 1,
    height: 55,
    backgroundColor: '#ff6f10',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  waBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    marginTop: 15,
  },
  soldOutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  soldOutBannerText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  disabledBottomBarBtn: {
    flex: 1,
    height: 55,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledBottomBarBtnText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
