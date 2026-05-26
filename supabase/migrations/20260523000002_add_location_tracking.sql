-- Add user location tracking fields for admin reporting and daily notifications
ALTER TABLE public.mundial_users
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS location_source text,
  ADD COLUMN IF NOT EXISTS location_address text,
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS location_region text,
  ADD COLUMN IF NOT EXISTS location_country text,
  ADD COLUMN IF NOT EXISTS location_ip text,
  ADD COLUMN IF NOT EXISTS location_isp text,
  ADD COLUMN IF NOT EXISTS detected_building text,
  ADD COLUMN IF NOT EXISTS last_location_at timestamp with time zone;
