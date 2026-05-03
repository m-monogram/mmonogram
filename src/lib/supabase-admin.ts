/**
 * Helper to query custom tables not in auto-generated Supabase types.
 * Since our CMS tables (site_content, user_roles, etc.) are created via SQL
 * and not yet reflected in the generated types, we use this helper.
 */
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

function getClient(): AnyClient {
  return supabase;
}

export function queryTable(table: string) {
  return getClient().from(table);
}

export { supabase };
