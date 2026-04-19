import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBookings } from '@/hooks/use-bookings';
import { useMotorcycles } from '@/hooks/use-motorcycles';

export default function MotorcycleDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const { addBooking, bookings } = useBookings();
  const { motorcycles, isLoading } = useMotorcycles();
  const [isInterested, setIsInterested] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const lastRecordedViewIdRef = useRef<string | null>(null);

  const motorcycle = id ? motorcycles.find((m) => m.motorcycle_id === id) : undefined;
  const isSoldOut = motorcycle?.listingStatus === 'sold_out';
  const formattedPrice = motorcycle
    ? motorcycle.price.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      })
    : '';

  // Track view once per product open (avoids loop: addBooking used to depend on bookings → new ref every update)
  useEffect(() => {
    if (!id || !motorcycle) return;
    if (lastRecordedViewIdRef.current === id) return;
    lastRecordedViewIdRef.current = id;
    void addBooking(motorcycle, 'view');
  }, [id, motorcycle, addBooking]);

  // Check if user is already interested in this motorcycle
  useEffect(() => {
    if (motorcycle && bookings) {
      const interested = bookings.find(
        (b) => b.motorcycle.motorcycle_id === motorcycle.motorcycle_id && b.type === 'interested'
      );
      setIsInterested(!!interested);
    }
  }, [motorcycle, bookings]);

  const handleInterestedPress = async () => {
    if (id && motorcycle && !isSoldOut) {
      await addBooking(motorcycle, 'interested');
      setIsInterested(true);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.errorText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!motorcycle) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.errorText}>Motorcycle not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Back Button */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={24} color="#1a1a1a" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: motorcycle.image }}
            style={[styles.image, isSoldOut && styles.imageDimmed]}
            contentFit="cover"
          />
          {isSoldOut ? (
            <View style={styles.soldOutRibbon}>
              <Text style={styles.soldOutRibbonText}>Sold out</Text>
            </View>
          ) : null}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <Text style={styles.title}>{motorcycle.title}</Text>
          <Text style={styles.price}>{formattedPrice}</Text>

          {/* Brand */}
          {motorcycle.engineCapacity && motorcycle.engineCapacity !== '-' ? (
            <View style={styles.locationRow}>
              <FontAwesome6 name="motorcycle" size={14} color="#ff6f10" />
              <Text style={styles.location}>{motorcycle.engineCapacity}</Text>
            </View>
          ) : null}

          {/* Rating */}
          {motorcycle.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <FontAwesome6
                    key={i}
                    name={i < Math.floor(motorcycle.rating || 0) ? 'star' : 'star'}
                    size={14}
                    color={i < Math.floor(motorcycle.rating || 0) ? '#ff6f10' : '#ddd'}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{motorcycle.rating} rating</Text>
            </View>
          )}

          {/* Description */}
          {motorcycle.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{motorcycle.description}</Text>
            </View>
          )}

          {isSoldOut ? (
            <View style={styles.soldOutNotice}>
              <FontAwesome6 name="circle-info" size={16} color="#666" />
              <Text style={styles.soldOutNoticeText}>
                Unit ini sudah terjual / tidak tersedia. Kamu tetap bisa melihat detailnya.
              </Text>
            </View>
          ) : null}

          {/* I'm Interested Button */}
          <Pressable
            style={[
              styles.interestedButton,
              isInterested && styles.interestedButtonActive,
              isSoldOut && styles.interestedButtonDisabled,
            ]}
            onPress={handleInterestedPress}
            disabled={isInterested || isSoldOut}
          >
            <FontAwesome6
              name={isInterested ? 'check' : 'heart'}
              size={16}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.interestedText}>
              {isSoldOut
                ? 'Tidak tersedia'
                : isInterested
                  ? 'Added to Bookings'
                  : "I'm Interested"}
            </Text>
          </Pressable>

          {showSuccessMessage && (
            <View style={styles.successMessage}>
              <FontAwesome6 name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.successText}>Added to your bookings!</Text>
            </View>
          )}

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      {/* Bottom Tab Navigation Spacer */}
      <View style={styles.tabSpacer} />
    </SafeAreaView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDimmed: {
    opacity: 0.55,
  },
  soldOutRibbon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  soldOutRibbonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  soldOutNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  soldOutNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ff6f10',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  specsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  specsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  interestedButton: {
    backgroundColor: '#ff6f10',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  interestedButtonActive: {
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
  interestedButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  buttonIcon: {
    marginTop: 2,
  },
  interestedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successMessage: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  tabSpacer: {
    height: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
});
