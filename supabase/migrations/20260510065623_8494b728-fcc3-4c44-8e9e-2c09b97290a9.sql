
-- Restrict SECURITY DEFINER helper functions: revoke EXECUTE from public/anon/authenticated.
-- These are only intended for use inside RLS policies, which evaluate them in a privileged
-- context regardless of role-level EXECUTE grants.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- Restrict listing on public storage buckets. Direct file access via public CDN URL
-- still works because the buckets are marked public; this only removes the ability
-- to enumerate file names through the storage API.
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
DROP POLICY IF EXISTS "Public read project image files" ON storage.objects;

-- Allow only admins/editors to list contents of these buckets.
CREATE POLICY "Admin list images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'images' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin list project-images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images' AND public.is_admin_or_editor(auth.uid()));
