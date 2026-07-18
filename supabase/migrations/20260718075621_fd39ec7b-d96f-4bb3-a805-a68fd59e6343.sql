DELETE FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE slug = 'monogram-roadster-teal');
DELETE FROM public.projects WHERE slug = 'monogram-roadster-teal';