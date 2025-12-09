-- =====================================================
-- CRM Refrimix Tecnologia - User Approval System
-- Execute this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create user_profiles table for approval workflow
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin can view all profiles
-- Updated to check for zappro.ia@gmail.com
CREATE POLICY "Admin can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'email') = 'zappro.ia@gmail.com'
  );

-- Admin can update profiles (approve/reject)
CREATE POLICY "Admin can update profiles" ON public.user_profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') = 'zappro.ia@gmail.com'
  );

-- Allow insert for new users (needed for trigger)
CREATE POLICY "Allow insert for authenticated" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'zappro.ia@gmail.com' THEN 'approved'
      ELSE 'pending'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- =====================================================
-- ADMIN: zappro.ia@gmail.com
-- is automatically approved when signing up
-- =====================================================
