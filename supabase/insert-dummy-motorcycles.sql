-- =============================================================================
-- Insert Dummy Motorcycles and Images
-- =============================================================================
-- Jalankan script ini di Supabase SQL Editor
-- =============================================================================

-- 1) Bersihkan data lama (Opsional, hati-hati jika sudah ada data asli)
-- TRUNCATE public.motorcycles CASCADE;

-- 2) Insert Motorcycles
INSERT INTO public.motorcycles (motorcycle_id, name, price, brand, description, stock, listing_status)
VALUES 
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'Kawasaki Ninja ZX-25R', 125000000, 'Kawasaki', 'Motor sport 250cc dengan mesin 4 silinder yang legendaris. Suara melengking dan performa tinggi.', 3, 'available'),
  ('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', 'Honda CBR250RR SP', 82000000, 'Honda', 'Total Control. Mesin 250cc 2 silinder terkencang di kelasnya dengan fitur Quick Shifter.', 2, 'available'),
  ('c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', 'Yamaha YZF-R15M', 44500000, 'Yamaha', 'DNA R-Series. Dilengkapi Traction Control dan ABS untuk keamanan berkendara.', 5, 'available'),
  ('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9', 'Vespa Sprint S 150', 61000000, 'Vespa', 'Ikon gaya hidup Italia. Perpaduan desain klasik dengan teknologi modern i-Get.', 2, 'available'),
  ('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a0', 'Yamaha NMAX "Turbo" 2024', 45000000, 'Yamaha', 'Generasi terbaru NMAX dengan teknologi YECVT yang memberikan sensasi turbo.', 8, 'available'),
  ('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1', 'Honda ADV 160', 39000000, 'Honda', 'Skutik penjelajah jalanan dengan suspensi tinggi dan fitur Honda Selectable Torque Control.', 4, 'available');

-- 3) Insert Images (Menggunakan gambar dari Unsplash yang relevan)
INSERT INTO public.motorcycle_images (motorcycle_id, image_url)
VALUES 
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=800'),
  ('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800'),
  ('c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=800'),
  ('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9', 'https://images.unsplash.com/photo-1563219436-0567f22312d8?q=80&w=800'),
  ('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a0', 'https://images.unsplash.com/photo-1620939511593-270876fc12f7?q=80&w=800'),
  ('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=800');
