-- ============================================
-- M-Monogram CMS Admin Panel - Database Schema
-- Copy and run this SQL in Supabase SQL Editor
-- ============================================

-- 1. User Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'editor')) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Site Content
CREATE TABLE public.site_content (
  id TEXT PRIMARY KEY, section_name TEXT NOT NULL, content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true, updated_at TIMESTAMPTZ DEFAULT now(), updated_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin/editor write" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin/editor update" ON public.site_content FOR UPDATE TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin/editor delete" ON public.site_content FOR DELETE TO authenticated USING (public.is_admin_or_editor(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); NEW.updated_by = auth.uid(); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Navigation Items
CREATE TABLE public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), label TEXT NOT NULL, href TEXT NOT NULL,
  location TEXT CHECK (location IN ('header', 'footer')) NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true, parent_id UUID REFERENCES public.navigation_items(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nav" ON public.navigation_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin/editor write nav" ON public.navigation_items FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- 4. Site Settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY, value JSONB NOT NULL DEFAULT '{}', description TEXT, updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin/editor write settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- 5. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public read images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'images');
CREATE POLICY "Admin/editor upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin/editor delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images' AND public.is_admin_or_editor(auth.uid()));

-- 6. Seed content
INSERT INTO public.site_content (id, section_name, content) VALUES
('hero', 'Hero Section', '{"buttonBookProject":"Book a Project","buttonDiscover":"Discover Collection"}'),
('mission', 'Mission Statement', '{"heading":"OUR MISSION","headingLine2":"GOES BEYOND TUNING","subtitle":"Luxury car modification and customization services in the UAE🇦🇪"}'),
('about', 'About Us', '{"values":["Craftsmanship","Innovation","Excellence"]}'),
('contact', 'Contact Info', '{"phone":"+971 54 507 7707","whatsapp":"971545077707","email":"m_monogram@mail.ru","address":"Dubai, UAE, Al Quoz Industrial Area 3","workHours":"Mon-Sat: 9AM - 7PM","landline":"+971 4 228 4177"}'),
('brand', 'Brand Page', '{"heroVideo":"/videos/brand-hero-video.mp4","coreValues":["Exclusivity","Precision","Innovation"]}'),
('footer', 'Footer', '{"socialLinks":[{"platform":"instagram","url":"https://www.instagram.com/metagarage_m_monogram/","label":"M-Monogram"}]}'),
('vin_banner', 'VIN Banner', '{"phones":["+971 54 507 7707","+971 4 228 4177"]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', '"M-Monogram"', 'Website name'),
('contact_email', '"m_monogram@mail.ru"', 'Primary contact email'),
('contact_phone', '"+971 54 507 7707"', 'Primary phone')
ON CONFLICT (key) DO NOTHING;
