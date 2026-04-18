import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBookings } from '@/hooks/use-bookings';
import { useMotorcycles } from '@/hooks/use-motorcycles';

export default function MotorcycleDetailScreen() {
  const { id } = useLocalSearchParams();
  const { addBooking, bookings } = useBookings();
  const { motorcycles, isLoading } = useMotorcycles();
  const [isInterested, setIsInterested] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const motorcycle = motorcycles.find((m) => m.motorcycle_id === id);
  const formattedPrice = motorcycle
    ? motorcycle.price.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      })
    : '';

  // Track view and check if interested
  useEffect(() => {
    if (id && typeof id === 'string' && motorcycle) {
      addBooking(motorcycle, 'view');
    }
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
    if (id && typeof id === 'string' && motorcycle) {
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
            style={styles.image}
            contentFit="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <Text style={styles.title}>{motorcycle.title}</Text>
          <Text style={styles.price}>{formattedPrice}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <FontAwesome6 name="location-dot" size={14} color="#ff6f10" />
            <Text style={styles.location}>{motorcycle.location}</Text>
          </View>

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

          {/* Specifications */}
          <View style={styles.specsContainer}>
            <Text style={styles.specsTitle}>Specifications</Text>

            <View style={styles.specRow}>
              <View style={styles.specItem}>
                <FontAwesome6 name="calendar" size={18} color="#ff6f10" />
                <Text style={styles.specLabel}>Year</Text>
                <Text style={styles.specValue}>{motorcycle.year}</Text>
              </View>

              <View style={styles.specItem}>
                <FontAwesome6 name="engine" size={18} color="#ff6f10" />
                <Text style={styles.specLabel}>Engine Capacity</Text>
                <Text style={styles.specValue}>{motorcycle.engineCapacity}</Text>
              </View>

              <View style={styles.specItem}>
                <FontAwesome6 name="road" size={18} color="#ff6f10" />
                <Text style={styles.specLabel}>Mileage</Text>
                <Text style={styles.specValue}>{motorcycle.mileage}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {motorcycle.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{motorcycle.description}</Text>
            </View>
          )}

          {/* I'm Interested Button */}
          <Pressable
            style={[
              styles.interestedButton,
              isInterested && styles.interestedButtonActive,
            ]}
            onPress={handleInterestedPress}
            disabled={isInterested}
          >
            <FontAwesome6
              name={isInterested ? 'check' : 'heart'}
              size={16}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.interestedText}>
              {isInterested ? 'Added to Bookings' : "I'm Interested"}
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
  },
  image: {
    width: '100%',
    height: '100%',
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
