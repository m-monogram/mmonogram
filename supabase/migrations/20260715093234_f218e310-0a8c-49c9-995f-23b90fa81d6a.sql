
-- Scope admin write policies to authenticated only
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin write projects" ON public.projects;
DROP POLICY IF EXISTS "Admin delete project images" ON public.project_images;
DROP POLICY IF EXISTS "Admin update project images" ON public.project_images;
DROP POLICY IF EXISTS "Admin write project images" ON public.project_images;

CREATE POLICY "Admin delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin write projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete project images" ON public.project_images FOR DELETE TO authenticated USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin update project images" ON public.project_images FOR UPDATE TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin write project images" ON public.project_images FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Explicit public SELECT policies for public storage buckets
DROP POLICY IF EXISTS "Public read images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read project-images bucket" ON storage.objects;

CREATE POLICY "Public read images bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'images');
CREATE POLICY "Public read project-images bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-images');
