ALTER POLICY "Admin read all projects"
ON public.projects
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));