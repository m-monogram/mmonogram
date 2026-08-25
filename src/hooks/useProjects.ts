import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  projects as staticProjects,
  STATIC_FAMILY_SLUGS,
} from '@/data/projects';
import { mediaUrl } from '@/lib/mediaUrl';

export interface DBProject {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  duration: string;
  package: string;
  category: string;
  cover_image: string;
  description: string;
  modifications: string[];
  specs: Record<string, string>;
  video_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images?: DBProjectImage[];
  isHub?: boolean;
  editionOf?: string;
  /** Static code-driven family (G-Wagen / Fusion) — not editable via CMS */
  isStatic?: boolean;
}

export interface DBProjectImage {
  id: string;
  project_id: string;
  src: string;
  title: string;
  sort_order: number;
}

const fallbackProjects: DBProject[] = staticProjects.map((p, idx) => ({
  id: p.id,
  slug: p.id,
  title: p.title,
  subtitle: p.subtitle,
  year: p.year,
  duration: p.duration,
  package: p.package,
  category: p.category,
  cover_image: p.coverImage,
  description: p.description,
  modifications: p.modifications,
  specs: p.specs as unknown as Record<string, string>,
  video_url: p.videoUrl ?? null,
  sort_order: idx,
  is_published: true,
  created_at: '',
  updated_at: '',
  isHub: p.isHub,
  editionOf: p.editionOf,
  isStatic: STATIC_FAMILY_SLUGS.has(p.id),
  images: p.images.map((img, i) => ({
    id: `${p.id}-${i}`,
    project_id: p.id,
    src: img.src,
    title: img.title,
    sort_order: i,
  })),
}));

export function useProjects(includeUnpublished = false) {
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
    // Use queryTable to bypass type restrictions
    const client = supabase as any;
    let query = client.from('projects').select('*').order('sort_order');
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    const { data: projectsData } = await query;
    
    if (!projectsData?.length) {
      setProjects(fallbackProjects);
      return;
    }

    // Fetch images for all projects
    const { data: imagesData } = await client
      .from('project_images')
      .select('*')
      .order('sort_order');

    const imagesByProject = (imagesData || []).reduce((acc: Record<string, DBProjectImage[]>, img: DBProjectImage) => {
      if (!acc[img.project_id]) acc[img.project_id] = [];
      acc[img.project_id].push(img);
      return acc;
    }, {} as Record<string, DBProjectImage[]>);

    const dbResult = (projectsData as DBProject[]).map(p => ({
      ...p,
      cover_image: mediaUrl(p.cover_image),
      images: (imagesByProject[p.id] || []).map((img) => ({
        ...img,
        src: mediaUrl(img.src),
      })),
    }));

    // G-Wagen and Fusion families always come from static data (hubs + editions)
    const fromDb = dbResult.filter((p) => !STATIC_FAMILY_SLUGS.has(p.slug));
    const dbSlugs = new Set(fromDb.map((p) => p.slug));
    const gwagen = fallbackProjects.filter((p) => STATIC_FAMILY_SLUGS.has(p.slug));
    const extras = fallbackProjects.filter((p) => !STATIC_FAMILY_SLUGS.has(p.slug) && !dbSlugs.has(p.slug));

    setProjects([
      ...gwagen.map((p) => ({ ...p, isStatic: true })),
      ...fromDb.map((p) => ({ ...p, isStatic: false })),
      ...extras.map((p) => ({ ...p, isStatic: STATIC_FAMILY_SLUGS.has(p.slug) })),
    ]);
    } catch {
      setProjects(fallbackProjects);
    } finally {
      setLoading(false);
    }
  }, [includeUnpublished]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
}
