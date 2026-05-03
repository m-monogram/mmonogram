import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { defaultContent } from '@/lib/defaultContent';
import { queryTable } from '@/lib/supabase-admin';

export function useContent(sectionId: string) {
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchContent = async () => {
      try {
        const { data, error } = await queryTable('site_content')
          .select('content, is_visible')
          .eq('id', sectionId)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data) {
          setContent(defaultContent[sectionId] ?? null);
          setIsVisible(true);
        } else {
          setContent(data.content as Record<string, unknown>);
          setIsVisible(data.is_visible ?? true);
        }
      } catch {
        if (!cancelled) {
          setContent(defaultContent[sectionId] ?? null);
          setIsVisible(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContent();

    const channel = supabase
      .channel(`site-content-${sectionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_content',
        filter: `id=eq.${sectionId}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row?.content) {
          setContent(row.content as Record<string, unknown>);
          if ('is_visible' in row) {
            setIsVisible(row.is_visible as boolean);
          }
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sectionId]);

  return { content, loading, isVisible };
}
