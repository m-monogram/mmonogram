-- Apply in Supabase SQL Editor for project larbfkggnpkvtzsyrnns
-- Creates public.bookings for website lead forms + admin CRM

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  car TEXT,
  service TEXT,
  budget TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit bookings" ON public.bookings;
CREATE POLICY "Public can submit bookings"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/editor read bookings" ON public.bookings;
CREATE POLICY "Admin/editor read bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admin/editor update bookings" ON public.bookings;
CREATE POLICY "Admin/editor update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admin/editor delete bookings" ON public.bookings;
CREATE POLICY "Admin/editor delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
