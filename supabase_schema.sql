-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Stray dogs
CREATE TABLE stray_dogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  photo TEXT,
  country TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  story TEXT,
  personality TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stray_dogs ENABLE ROW LEVEL SECURITY;

-- User stats / profiles
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  user_name TEXT,
  age_range TEXT,
  country TEXT,
  gender TEXT,
  relationship_status TEXT,
  employment_status TEXT,
  household_size TEXT,
  income_range TEXT,
  interests JSONB DEFAULT '[]',
  values JSONB DEFAULT '[]',
  lifestyle TEXT,
  shopping_frequency TEXT,
  shopping_channels JSONB DEFAULT '[]',
  primary_device TEXT,
  social_media_platforms JSONB DEFAULT '[]',
  daily_screen_time TEXT,
  purchase_intent_categories JSONB DEFAULT '[]',
  registration_completed BOOLEAN DEFAULT false,
  total_ads_watched INTEGER DEFAULT 0,
  total_meals_provided INTEGER DEFAULT 0,
  total_dogs_fed INTEGER DEFAULT 0,
  current_progress INTEGER DEFAULT 0,
  current_target INTEGER DEFAULT 5,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TEXT,
  avatar_url TEXT,
  referral_code TEXT,
  referral_count INTEGER DEFAULT 0,
  total_referral_meals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User adopted dogs
CREATE TABLE user_dogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  dog_id TEXT,
  dog_name TEXT,
  dog_photo TEXT,
  dog_country TEXT,
  dog_city TEXT,
  adoption_date TEXT,
  last_fed_date TEXT,
  times_fed INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  happiness REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_dogs ENABLE ROW LEVEL SECURITY;

-- Feeder profiles
CREATE TABLE feeder_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeder_profiles ENABLE ROW LEVEL SECURITY;

-- Pending meals
CREATE TABLE pending_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  dog_id TEXT,
  dog_name TEXT,
  scheduled_date TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pending_meals ENABLE ROW LEVEL SECURITY;

-- Social posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  content TEXT,
  image_url TEXT,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Post likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Reward allocations
CREATE TABLE reward_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  amount INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reward_allocations ENABLE ROW LEVEL SECURITY;

-- Daily feeding logs
CREATE TABLE daily_feeding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  date TEXT,
  meal_count INTEGER DEFAULT 0,
  ad_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_feeding_logs ENABLE ROW LEVEL SECURITY;

-- Dev messages
CREATE TABLE dev_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  user_name TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dev_messages ENABLE ROW LEVEL SECURITY;

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_email TEXT,
  referred_email TEXT,
  meals_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Feeding media
CREATE TABLE feeding_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  dog_id TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'photo',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeding_media ENABLE ROW LEVEL SECURITY;

-- Feeding feedback
CREATE TABLE feeding_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  dog_id TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeding_feedback ENABLE ROW LEVEL SECURITY;

-- Feeder bank details
CREATE TABLE feeder_bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeder_bank_details ENABLE ROW LEVEL SECURITY;

-- Access codes
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  type TEXT DEFAULT 'feeder_registration',
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TEXT
);

ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Feeding logs
CREATE TABLE feeding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  dog_id TEXT,
  dog_name TEXT,
  meal_type TEXT DEFAULT 'regular',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeding_logs ENABLE ROW LEVEL SECURITY;

-- Feeding sessions
CREATE TABLE feeding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  session_date TEXT,
  meals_provided INTEGER DEFAULT 0,
  ads_watched INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeding_sessions ENABLE ROW LEVEL SECURITY;

-- Feeding photo backlog
CREATE TABLE feeding_photo_backlog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  dog_id TEXT,
  photo_url TEXT,
  reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feeding_photo_backlog ENABLE ROW LEVEL SECURITY;

-- AI-generated dog bios
CREATE TABLE dog_bios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id TEXT NOT NULL UNIQUE,
  dog_name TEXT,
  bio TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dog_bios ENABLE ROW LEVEL SECURITY;

-- Special gifts
CREATE TABLE special_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  gift_type TEXT,
  amount INTEGER DEFAULT 1,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE special_gifts ENABLE ROW LEVEL SECURITY;

-- Daily activity snapshots (for dev portal charts & historical tracking)
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TEXT UNIQUE NOT NULL,
  active_users INTEGER DEFAULT 0,
  ads_watched INTEGER DEFAULT 0,
  meals_provided INTEGER DEFAULT 0,
  server_hours INTEGER DEFAULT 0,
  regular_ads INTEGER DEFAULT 0,
  supporter_ads INTEGER DEFAULT 0,
  dev_support_ads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- Seed data (your historical records)
INSERT INTO daily_activity (date, ads_watched) VALUES
  ('2026-06-01', 45),
  ('2026-06-02', 84),
  ('2026-06-03', 76),
  ('2026-06-04', 97),
  ('2026-06-05', 198),
  ('2026-06-06', 87),
  ('2026-06-07', 99),
  ('2026-06-08', 123),
  ('2026-06-09', 207),
  ('2026-06-10', 50),
  ('2026-06-11', 90),
  ('2026-06-12', 179),
  ('2026-06-13', 250),
  ('2026-06-14', 150),
  ('2026-06-15', 120),
  ('2026-06-16', 90),
  ('2026-06-17', 230),
  ('2026-06-18', 100),
  ('2026-06-25', 235),
  ('2026-06-26', 399),
  ('2026-06-27', 508)
ON CONFLICT (date) DO NOTHING;

-- RLS policy
CREATE POLICY "allow_all_daily_activity" ON daily_activity FOR ALL USING (true) WITH CHECK (true);
