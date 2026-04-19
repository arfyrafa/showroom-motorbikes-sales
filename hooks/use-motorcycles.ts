import { Motorcycle, MotorcycleListingStatus } from '@/constants/motorcycles';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect, useState } from 'react';

interface RawMotorcycleRow {
  motorcycle_id: string;
  name: string;
  price: number;
  brand: string | null;
  description: string | null;
  listing_status?: MotorcycleListingStatus | null;
}

interface MotorcycleImageRow {
  motorcycle_id: string;
  image_url: string;
}

function inferMimeType(uri: string, mimeType?: string) {
  if (mimeType) return mimeType;

  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (!ext) return 'application/octet-stream';

  const byExt: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    gif: 'image/gif',
  };

  return byExt[ext] ?? 'application/octet-stream';
}

export interface CreateMotorcycleInput {
  title: string;
  price: number;
  brand?: string;
  description?: string;
  imageUri: string;
  mimeType?: string;
}

function mapRowToMotorcycle(row: RawMotorcycleRow, imageUrl?: string): Motorcycle {
  const listingStatus: MotorcycleListingStatus =
    row.listing_status === 'sold_out' ? 'sold_out' : 'available';

  return {
    motorcycle_id: row.motorcycle_id,
    title: row.name,
    price: Number(row.price),
    location: '-',
    image: imageUrl ?? '',
    rating: undefined,
    year: new Date().getFullYear(),
    engineCapacity: row.brand ?? '-',
    mileage: '-',
    description: row.description ?? undefined,
    listingStatus,
  };
}

async function uploadImageToStorage(uri: string, mimeType?: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);
  const normalizedMimeType = inferMimeType(uri, mimeType);
  const extFromMime = normalizedMimeType.split('/')[1];
  const extFromUri = uri.split('.').pop()?.split('?')[0];
  const ext = extFromUri ?? extFromMime ?? 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `admin-uploads/${fileName}`;

  try {
    const uploadResult = await supabase.storage
      .from('motorcycles')
      .upload(filePath, arrayBuffer, {
        contentType: normalizedMimeType,
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
  } catch (error) {
    console.error('⚠️ Storage upload failed, using data URL fallback:', error);
    return {
      path: null,
      publicUrl: `data:${normalizedMimeType};base64,${base64}`,
    };
  }
}

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMotorcycles = useCallback(async () => {
    setError(null);
    try {
      const { data: motorcycleRows, error: fetchError } = await supabase
        .from('motorcycles')
        .select('motorcycle_id,name,price,brand,description,listing_status')
        .order('created_at', { ascending: false });

      if (fetchError) {
        const errorMsg =
          fetchError.message || JSON.stringify(fetchError) || 'Unknown database error';
        setError(errorMsg);
        setMotorcycles([]);
        return;
      }

      const rows = (motorcycleRows ?? []) as RawMotorcycleRow[];
      const ids = rows.map((row) => row.motorcycle_id).filter(Boolean);
      const imageByMotorcycleId = new Map<string, string>();

      if (ids.length > 0) {
        const { data: imageRows, error: imageError } = await supabase
          .from('motorcycle_images')
          .select('motorcycle_id,image_url')
          .in('motorcycle_id', ids);

        if (!imageError && imageRows) {
          (imageRows as MotorcycleImageRow[]).forEach((row) => {
            if (!imageByMotorcycleId.has(row.motorcycle_id)) {
              imageByMotorcycleId.set(row.motorcycle_id, row.image_url);
            }
          });
        }
      }

      const mapped = rows.map((row) =>
        mapRowToMotorcycle(row, imageByMotorcycleId.get(row.motorcycle_id))
      );
      setMotorcycles(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
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
      const image = await uploadImageToStorage(payload.imageUri, payload.mimeType);

      const newSchemaInsert = await supabase
        .from('motorcycles')
        .insert({
          name: payload.title,
          price: payload.price,
          description: payload.description ?? null,
          brand: payload.brand ?? null,
          stock: 1,
          listing_status: 'available',
        })
        .select('motorcycle_id')
        .single();

      if (newSchemaInsert.error || !newSchemaInsert.data?.motorcycle_id) {
        throw newSchemaInsert.error ?? new Error('Failed to create motorcycle.');
      }

      const imageInsert = await supabase.from('motorcycle_images').insert({
        motorcycle_id: newSchemaInsert.data.motorcycle_id,
        image_url: image.publicUrl,
      });

      if (imageInsert.error) {
        throw imageInsert.error;
      }

      await fetchMotorcycles();
    },
    [fetchMotorcycles]
  );

  const updateMotorcycleListingStatus = useCallback(
    async (motorcycleId: string, listingStatus: MotorcycleListingStatus) => {
      const { error: updateError } = await supabase
        .from('motorcycles')
        .update({ listing_status: listingStatus })
        .eq('motorcycle_id', motorcycleId);

      if (updateError) {
        throw updateError;
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
    updateMotorcycleListingStatus,
  };
}
