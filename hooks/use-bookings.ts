import { Motorcycle } from '@/constants/motorcycles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface BookingRecord {
  id: string;
  motorcycle: Motorcycle;
  type: 'view' | 'interested';
  timestamp: number;
}

const BOOKINGS_STORAGE_KEY = '@motomarket_bookings';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load bookings from storage
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const addBooking = useCallback(
    async (motorcycle: Motorcycle, type: 'view' | 'interested' = 'view') => {
      try {
        // Check if already interested in this motorcycle
        const existingInterested = bookings.find(
          (b) => b.motorcycle.motorcycle_id === motorcycle.motorcycle_id && b.type === 'interested'
        );

        if (existingInterested && type === 'interested') {
          return; // Already interested
        }

        const newBooking: BookingRecord = {
          id: `${motorcycle.motorcycle_id}-${Date.now()}`,
          motorcycle,
          type,
          timestamp: Date.now(),
        };

        const updated = [newBooking, ...bookings];
        setBookings(updated);
        await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error adding booking:', error);
      }
    },
    [bookings]
  );

  const removeBooking = useCallback(
    async (bookingId: string) => {
      try {
        const updated = bookings.filter((b) => b.id !== bookingId);
        setBookings(updated);
        await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error removing booking:', error);
      }
    },
    [bookings]
  );

  const clearBookings = useCallback(async () => {
    try {
      setBookings([]);
      await AsyncStorage.removeItem(BOOKINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing bookings:', error);
    }
  }, []);

  return {
    bookings,
    isLoading,
    addBooking,
    removeBooking,
    clearBookings,
  };
}
