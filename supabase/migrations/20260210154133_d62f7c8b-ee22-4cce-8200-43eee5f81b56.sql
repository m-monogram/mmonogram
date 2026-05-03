
-- Projects table for CMS management
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  package text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  modifications text[] NOT NULL DEFAULT '{}',
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  video_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Project images table
CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  src text NOT NULL,
  title text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- Public can read published projects
CREATE POLICY "Public read published projects"
  ON public.projects FOR SELECT
  USING (is_published = true);

-- Admin/editor read all projects (including drafts)
CREATE POLICY "Admin read all projects"
  ON public.projects FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- Admin/editor write projects
CREATE POLICY "Admin write projects"
  ON public.projects FOR INSERT
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin update projects"
  ON public.projects FOR UPDATE
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete projects"
  ON public.projects FOR DELETE
  USING (is_admin_or_editor(auth.uid()));

-- Project images policies
CREATE POLICY "Public read project images"
  ON public.project_images FOR SELECT
  USING (true);

CREATE POLICY "Admin write project images"
  ON public.project_images FOR INSERT
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin update project images"
  ON public.project_images FOR UPDATE
  USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete project images"
  ON public.project_images FOR DELETE
  USING (is_admin_or_editor(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images
CREATE POLICY "Public read project image files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Admin upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin update project images storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-images' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete project images storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND is_admin_or_editor(auth.uid()));
