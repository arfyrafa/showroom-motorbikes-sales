import { Share, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { Motorcycle } from '@/constants/motorcycles';

/**
 * Universal helper function to share a motorcycle's information via the system share sheet.
 * @param motorcycle The motorcycle object to share.
 */
export async function shareMotorcycle(motorcycle: Motorcycle) {
  try {
    const formattedPrice = motorcycle.price.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    });

    const shareUrl = Linking.createURL('/motorcycle-detail', {
      queryParams: { id: motorcycle.motorcycle_id },
    });

    const message = `Check out this awesome motorcycle on MotoMarket!\n\n${motorcycle.title} (${motorcycle.year || new Date().getFullYear()})\nPrice: ${formattedPrice}\nEngine: ${motorcycle.engineCapacity || '-'}\nMileage: ${motorcycle.mileage || '-'}\n\nView details here: ${shareUrl}`;

    await Share.share({
      message,
      title: motorcycle.title,
    });
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Something went wrong while sharing.');
  }
}
