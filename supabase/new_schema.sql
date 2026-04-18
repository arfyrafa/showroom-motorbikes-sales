-- ==============================
-- ENUMS
-- ==============================
DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'customer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==============================
-- USERS PROFILE TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- SHOWROOM TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS showrooms (
    showroom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- MOTORCYCLES TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS motorcycles (
    motorcycle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    showroom_id UUID REFERENCES showrooms(showroom_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    price BIGINT,
    stock INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- MOTORCYCLE IMAGES TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS motorcycle_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motorcycle_id UUID REFERENCES motorcycles(motorcycle_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- BOOKINGS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_date DATE,
    status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- BOOKING DETAILS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS booking_details (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(booking_id) ON DELETE CASCADE,
    motorcycle_id UUID REFERENCES motorcycles(motorcycle_id),
    quantity INT DEFAULT 1,
    price BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_details ENABLE ROW LEVEL SECURITY;

-- ==============================
-- POLICIES
-- ==============================
-- Profiles
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Superadmin full access profiles"
ON profiles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'superadmin'
    )
);

-- Bookings
CREATE POLICY "Users can view their bookings"
ON bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert bookings"
ON bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ==============================
-- TRIGGER: AUTO INSERT PROFILE ON REGISTER
-- ==============================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
