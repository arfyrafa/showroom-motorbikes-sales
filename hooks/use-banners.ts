import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  action_link: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  imageUri: string;
  mimeType?: string;
  action_link?: string;
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

async function uploadBannerImage(uri: string, mimeType?: string) {
  let base64 = '';
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          const base64Str = resultStr.split(',')[1];
          resolve(base64Str);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error reading file as base64 on web:', err);
    }
  } else {
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const arrayBuffer = decode(base64);
  const normalizedMimeType = inferMimeType(uri, mimeType);
  const extFromMime = normalizedMimeType.split('/')[1];
  const extFromUri = uri.split('.').pop()?.split('?')[0];
  const ext = extFromUri ?? extFromMime ?? 'bin';
  const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `banners/${fileName}`;

  try {
    const uploadResult = await supabase.storage
      .from('motorcycles')
      .upload(filePath, arrayBuffer, {
        contentType: normalizedMimeType,
        upsert: false,
      });

    if (uploadResult.error) throw uploadResult.error;
    const publicUrlResult = supabase.storage.from('motorcycles').getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: publicUrlResult.data.publicUrl,
    };
  } catch (error) {
    console.error('Storage upload failed:', error);
    return {
      path: null,
      publicUrl: `data:${normalizedMimeType};base64,${base64}`,
    };
  }
}

export function useBanners(fetchOnlyActive: boolean = false) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    setError(null);
    try {
      let query = supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchOnlyActive) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setBanners((data as Banner[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setBanners([]);
    }
  }, [fetchOnlyActive]);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      await fetchBanners();
      setIsLoading(false);
    };
    run();
  }, [fetchBanners]);

  const createBanner = useCallback(async (payload: CreateBannerInput) => {
    const image = await uploadBannerImage(payload.imageUri, payload.mimeType);

    const { error: insertError } = await supabase.from('banners').insert({
      title: payload.title,
      subtitle: payload.subtitle ?? null,
      image_url: image.publicUrl,
      action_link: payload.action_link ?? null,
      is_active: true,
    });

    if (insertError) throw insertError;
    await fetchBanners();
  }, [fetchBanners]);

  const toggleBannerStatus = useCallback(async (id: string, currentStatus: boolean) => {
    const { error: updateError } = await supabase
      .from('banners')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (updateError) throw updateError;
    await fetchBanners();
  }, [fetchBanners]);

  const deleteBanner = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    await fetchBanners();
  }, [fetchBanners]);

  return {
    banners,
    isLoading,
    error,
    refresh: fetchBanners,
    createBanner,
    toggleBannerStatus,
    deleteBanner,
  };
}
