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

  const addBooking = useCallback(async (motorcycle: Motorcycle, type: 'view' | 'interested' = 'view') => {
    try {
      let next: BookingRecord[] | null = null;
      setBookings((prev) => {
        const existingInterested = prev.find(
          (b) => b.motorcycle.motorcycle_id === motorcycle.motorcycle_id && b.type === 'interested'
        );

        if (existingInterested && type === 'interested') {
          return prev;
        }

        const newBooking: BookingRecord = {
          id: `${motorcycle.motorcycle_id}-${Date.now()}`,
          motorcycle,
          type,
          timestamp: Date.now(),
        };

        next = [newBooking, ...prev];
        return next;
      });

      if (next) {
        await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
      }
    } catch (error) {
      console.error('Error adding booking:', error);
    }
  }, []);

  const removeBooking = useCallback(async (bookingId: string) => {
    try {
      let next: BookingRecord[] = [];
      setBookings((prev) => {
        next = prev.filter((b) => b.id !== bookingId);
        return next;
      });
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error removing booking:', error);
    }
  }, []);

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
