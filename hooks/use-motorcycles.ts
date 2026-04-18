import { Motorcycle } from '@/constants/motorcycles';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

interface RawMotorcycleRow {
  motorcycle_id: string;
  title: string;
  price: number;
  location: string | null;
  image: string | null;
  image_url: string | null;
  rating: number | null;
  year: number | null;
  engine_capacity: string | null;
  mileage: string | null;
  description: string | null;
}

export interface CreateMotorcycleInput {
  title: string;
  price: number;
  location: string;
  year: number;
  engineCapacity: string;
  mileage: string;
  description?: string;
  rating?: number;
  imageUri: string;
  mimeType?: string;
}

function mapRowToMotorcycle(row: RawMotorcycleRow): Motorcycle {
  return {
    motorcycle_id: row.motorcycle_id,
    title: row.title,
    price: Number(row.price),
    location: row.location ?? 'Unknown location',
    image: row.image_url ?? row.image ?? '',
    rating: row.rating ?? undefined,
    year: row.year ?? new Date().getFullYear(),
    engineCapacity: row.engine_capacity ?? '-',
    mileage: row.mileage ?? '-',
    description: row.description ?? undefined,
  };
}

async function uploadImageToStorage(uri: string, mimeType?: string) {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const ext = mimeType?.split('/')[1] ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `admin-uploads/${fileName}`;

  const uploadResult = await supabase.storage
    .from('motorcycles')
    .upload(filePath, arrayBuffer, {
      contentType: mimeType ?? 'image/jpeg',
      upsert: false,
    });

  if (uploadResult.error) {
    throw uploadResult.error;
  }

  const publicUrlResult = supabase.storage.from('motorcycles').getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: publicUrlResult.data.publicUrl,
  };
}

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMotorcycles = useCallback(async () => {
    setError(null);
    try {
      console.log('🔍 Fetching motorcycles from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('motorcycles')
        .select('motorcycle_id,title,price,location,image,image_url,rating,year,engine_capacity,mileage,description')
        .order('created_at', { ascending: false });

      if (fetchError) {
        const errorMsg = fetchError.message || JSON.stringify(fetchError) || 'Unknown database error';
        console.error('❌ Database fetch error:', errorMsg);
        console.error('❌ Full error object:', fetchError);
        setError(errorMsg);
        setMotorcycles([]);
        return;
      }

      console.log('✅ Motorcycles fetched:', data?.length ?? 0);
      const mapped = (data ?? []).map((row: unknown) => mapRowToMotorcycle(row as RawMotorcycleRow));
      setMotorcycles(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Motorcycles fetch exception:', message);
      console.error('❌ Full error:', err);
      setError(message);
      setMotorcycles([]);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      await fetchMotorcycles();
      setIsLoading(false);
    };

    run();
  }, [fetchMotorcycles]);

  const createMotorcycleByAdmin = useCallback(
    async (payload: CreateMotorcycleInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const image = await uploadImageToStorage(payload.imageUri, payload.mimeType);

      // First try full schema (schema.sql)
      const fullInsert = await supabase.from('motorcycles').insert({
        title: payload.title,
        price: payload.price,
        currency: 'IDR',
        location: payload.location,
        year: payload.year,
        engine_capacity: payload.engineCapacity,
        mileage: payload.mileage,
        description: payload.description ?? null,
        image_url: image.publicUrl,
        image_path: image.path,
        rating: payload.rating ?? null,
        created_by: userId ?? null,
      });

      if (fullInsert.error) {
        // Fallback to init schema (init_schema.sql)
        const fallbackInsert = await supabase.from('motorcycles').insert({
          motorcycle_id: `${Date.now()}`,
          title: payload.title,
          price: payload.price,
          location: payload.location,
          image: image.publicUrl,
          rating: payload.rating ?? null,
          year: payload.year,
          engine_capacity: payload.engineCapacity,
          mileage: payload.mileage,
          description: payload.description ?? null,
        });

        if (fallbackInsert.error) {
          throw fallbackInsert.error;
        }
      }

      await fetchMotorcycles();
    },
    [fetchMotorcycles]
  );

  return {
    motorcycles,
    isLoading,
    error,
    refresh: fetchMotorcycles,
    createMotorcycleByAdmin,
  };
}
