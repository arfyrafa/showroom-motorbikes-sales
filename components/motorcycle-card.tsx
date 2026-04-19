import { Motorcycle } from '@/constants/motorcycles';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  onPress: () => void;
}

export function MotorcycleCard({ motorcycle, onPress }: MotorcycleCardProps) {
  const isSoldOut = motorcycle.listingStatus === 'sold_out';
  const formattedPrice = motorcycle.price.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });

  return (
    <Pressable style={[styles.card, isSoldOut && styles.cardSoldOut]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: motorcycle.image }}
          style={[styles.image, isSoldOut && styles.imageDimmed]}
          contentFit="cover"
        />
        {isSoldOut ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutBadgeText}>SOLD OUT</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {motorcycle.title}
        </Text>

        {typeof motorcycle.rating === 'number' ? (
          <View style={styles.ratingContainer}>
            <FontAwesome6 name="star" size={12} color="#ff6f10" />
            <Text style={styles.ratingText}>{motorcycle.rating}</Text>
          </View>
        ) : null}

        <View style={styles.footerContainer}>
          <View>
            <Text style={styles.price}>{formattedPrice}</Text>
            {motorcycle.engineCapacity && motorcycle.engineCapacity !== '-' ? (
              <Text style={styles.location}>{motorcycle.engineCapacity}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardSoldOut: {
    opacity: 0.92,
  },
  imageContainer: {
    width: '100%',
    height: 200,
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
  soldOutBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  soldOutBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
    color: '#ff6f10',
    fontWeight: '600',
    marginLeft: 4,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6f10',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
