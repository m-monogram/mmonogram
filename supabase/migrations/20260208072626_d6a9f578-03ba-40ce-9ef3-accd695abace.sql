
-- Fix function search_path warning for update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = now(); 
  NEW.updated_by = auth.uid(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
