
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  -- Only set updated_by if the column exists
  IF TG_TABLE_NAME IN ('site_content') THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;
