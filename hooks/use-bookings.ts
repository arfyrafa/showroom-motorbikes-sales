import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useCallback, useEffect, useState } from 'react';

export interface BookingRecord {
  id: string;
  motorcycle_id: string;
  type: 'view' | 'interested';
  timestamp: number;
  visit_date?: string | null;
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('motorcycle_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: BookingRecord[] = data.map((row: any) => ({
          id: row.booking_id,
          motorcycle_id: row.motorcycle_id,
          type: row.interaction_type,
          timestamp: new Date(row.created_at).getTime(),
          visit_date: row.visit_date,
        }));
        setBookings(mapped);
      }
    } catch (error) {
      console.error('Error loading bookings from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = useCallback(async (
    motorcycleId: string, 
    type: 'view' | 'interested' = 'view',
    visitDate?: string
  ) => {
    if (!user) return; // Harus login untuk menyimpan ke Supabase

    try {
      // Cek apakah sudah ada
      const existingInterested = bookings.find(
        (b) => b.motorcycle_id === motorcycleId && b.type === 'interested'
      );

      if (existingInterested && type === 'interested') {
        // Update visit date jika ada
        if (visitDate) {
          await supabase
            .from('motorcycle_bookings')
            .update({ visit_date: visitDate })
            .eq('booking_id', existingInterested.id);
          await fetchBookings();
        }
        return;
      }

      // Insert ke Supabase
      const { error } = await supabase.from('motorcycle_bookings').insert({
        motorcycle_id: motorcycleId,
        interaction_type: type,
        user_id: user.id,
        visit_date: visitDate || null
      });

      if (error) throw error;
      
      // Refresh data
      await fetchBookings();
    } catch (error) {
      console.error('Error adding booking to Supabase:', error);
    }
  }, [user, bookings, fetchBookings]);

  const removeBooking = useCallback(async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('motorcycle_bookings')
        .delete()
        .eq('booking_id', bookingId);
        
      if (error) throw error;
      await fetchBookings();
    } catch (error) {
      console.error('Error removing booking:', error);
    }
  }, [fetchBookings]);

  const clearBookings = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('motorcycle_bookings')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      await fetchBookings();
    } catch (error) {
      console.error('Error clearing bookings:', error);
    }
  }, [user, fetchBookings]);

  return {
    bookings,
    isLoading,
    addBooking,
    removeBooking,
    clearBookings,
    refresh: fetchBookings,
  };
}

