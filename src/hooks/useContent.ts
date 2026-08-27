import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { defaultContent } from '@/lib/defaultContent';
import { queryTable } from '@/lib/supabase-admin';
import { rewriteMediaInValue } from '@/lib/mediaUrl';

export function useContent(sectionId: string) {
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  /* Живое обновление секции нужно тому, кто её правит: редактор смотрит сайт
     в соседней вкладке и видит правку сразу. Обычному посетителю оно не нужно
     совсем, а стоило дорого — по постоянному веб-сокету на каждую секцию
     страницы (на главной их две) у каждого посетителя, и всё это идёт в
     квоту Supabase Realtime. */
  const { canEdit } = useAuth();

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
          setContent(rewriteMediaInValue(data.content) as Record<string, unknown>);
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

    if (!canEdit) {
      return () => {
        cancelled = true;
      };
    }

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
          setContent(rewriteMediaInValue(row.content) as Record<string, unknown>);
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
  }, [canEdit, sectionId]);

  return { content, loading, isVisible };
}
