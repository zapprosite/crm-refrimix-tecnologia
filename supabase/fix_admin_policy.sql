-- =====================================================
-- REPAIR SCRIPT: Fix Admin Policies & Missing Profile
-- Execute this in Supabase SQL Editor to fix the "Error loading users"
-- =====================================================

-- 1. Drop old policies that might reference the wrong email
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.user_profiles;

-- 2. Re-create policies with correct email and safer JWT check
CREATE POLICY "Admin can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'email') = 'zappro.ia@gmail.com'
  );

CREATE POLICY "Admin can update profiles" ON public.user_profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') = 'zappro.ia@gmail.com'
  );

-- 3. Update the trigger function to auto-approve zappro.ia in future
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

-- 4. ENSURE zappro.ia@gmail.com HAS A PROFILE AND IS APPROVED
-- This fixes the issue if the user signed up before the trigger was working
INSERT INTO public.user_profiles (id, email, full_name, approval_status)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Admin Zappro'), 
  'approved'
FROM auth.users
WHERE email = 'zappro.ia@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET approval_status = 'approved';

-- 5. Helper to verify in SQL Editor response
SELECT * FROM public.user_profiles WHERE email = 'zappro.ia@gmail.com';
