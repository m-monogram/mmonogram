import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  projects as staticProjects,
  GWAGEN_HUB_ID,
  GWAGEN_EDITION_ORDER,
} from '@/data/projects';
import { mediaUrl } from '@/lib/mediaUrl';

const GWAGEN_SLUGS = new Set<string>([GWAGEN_HUB_ID, ...GWAGEN_EDITION_ORDER]);

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

    // G-Wagen family always comes from static data (black hub + 3 editions)
    const fromDb = dbResult.filter((p) => !GWAGEN_SLUGS.has(p.slug));
    const dbSlugs = new Set(fromDb.map((p) => p.slug));
    const gwagen = fallbackProjects.filter((p) => GWAGEN_SLUGS.has(p.slug));
    const extras = fallbackProjects.filter((p) => !GWAGEN_SLUGS.has(p.slug) && !dbSlugs.has(p.slug));

    setProjects([...gwagen, ...fromDb, ...extras]);
    } catch {
      setProjects(fallbackProjects);
    } finally {
      setLoading(false);
    }
  }, [includeUnpublished]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
}
