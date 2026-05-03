export type AppRole = 'admin' | 'editor' | 'viewer';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface SiteContent {
  id: string;
  section_name: string;
  content: Record<string, unknown>;
  is_visible: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  location: 'header' | 'footer';
  sort_order: number;
  is_visible: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
}
