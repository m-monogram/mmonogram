GRANT EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.project_images TO anon;