import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Image, Users, Clock, Car, Plus, Upload, ChevronRight, Activity, MessageSquare } from 'lucide-react';
import { queryTable } from '@/lib/supabase-admin';
import { supabase } from '@/integrations/supabase/client';
import type { SiteContent } from '@/lib/admin-types';

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<SiteContent[]>([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [bookingsNew, setBookingsNew] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const client = supabase as any;
      const [sectionsRes, mediaRes, projectMediaRes, projectsRes, bookingsRes] = await Promise.all([
        queryTable('site_content').select('*').order('updated_at', { ascending: false }),
        supabase.storage.from('images').list('', { limit: 1000 }),
        supabase.storage.from('project-images').list('', { limit: 1000 }),
        client.from('projects').select('id'),
        queryTable('bookings').select('id').eq('status', 'new'),
      ]);
      setSections((sectionsRes.data as SiteContent[]) ?? []);
      const imagesCount = (mediaRes.data || []).filter(f => f.name !== '.emptyFolderPlaceholder').length;
      const projImagesCount = (projectMediaRes.data || []).filter(f => f.name !== '.emptyFolderPlaceholder').length;
      setMediaCount(imagesCount + projImagesCount);
      setProjectsCount(projectsRes.data?.length || 0);
      setBookingsNew(bookingsRes.data?.length || 0);
      setLoading(false);
    })();
  }, []);

  const stats = [
    { icon: Car, label: 'Проекты', value: loading ? '—' : projectsCount, to: '/admin/projects', color: 'text-blue-400' },
    { icon: MessageSquare, label: 'Заявки (новые)', value: loading ? '—' : bookingsNew, to: '/admin/bookings', color: bookingsNew > 0 ? 'text-yellow-400' : 'text-green-400' },
    { icon: FileText, label: 'Секции', value: loading ? '—' : sections.length, to: '/admin/sections', color: 'text-purple-400' },
    { icon: Image, label: 'Медиафайлы', value: loading ? '—' : mediaCount, to: '/admin/media', color: 'text-green-400' },
  ];

  const recentUpdates = sections.slice(0, 5);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground font-display text-2xl tracking-widest uppercase">Dashboard</h1>
          <p className="text-foreground/40 text-sm font-body mt-1 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            {user?.email}
            <span className="text-foreground/20">·</span>
            <span className="uppercase text-foreground/30 text-xs">{role}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-green-400/70 text-xs">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-foreground/30 text-xs uppercase tracking-wider mb-3">Быстрые действия</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/projects')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-body uppercase tracking-wider hover:bg-foreground/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Новый проект
          </button>
          <button
            onClick={() => navigate('/admin/media')}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/10 text-foreground text-xs font-body uppercase tracking-wider hover:bg-foreground/20 transition-all border border-foreground/10"
          >
            <Upload className="w-3.5 h-3.5" /> Загрузить медиа
          </button>
          <button
            onClick={() => navigate('/admin/sections')}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/10 text-foreground text-xs font-body uppercase tracking-wider hover:bg-foreground/20 transition-all border border-foreground/10"
          >
            <FileText className="w-3.5 h-3.5" /> Редактировать секции
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.to)}
            className="bg-white/[0.03] border border-white/[0.07] p-5 text-left hover:border-foreground/20 hover:bg-white/[0.05] transition-all group"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3 opacity-70 group-hover:opacity-100 transition-opacity`} />
            <p className="text-foreground text-2xl font-display">{stat.value}</p>
            <p className="text-foreground/40 text-xs font-body mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Last updated */}
      <div>
        <p className="text-foreground/30 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Последние изменения
        </p>
        {loading ? (
          <div className="text-foreground/30 text-sm">Загрузка...</div>
        ) : recentUpdates.length === 0 ? (
          <div className="text-foreground/30 text-sm">Нет данных.</div>
        ) : (
          <div className="space-y-1.5">
            {recentUpdates.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/admin/sections/${s.id}`)}
                className="w-full flex items-center justify-between bg-white/[0.02] border border-white/[0.07] hover:border-foreground/15 hover:bg-white/[0.04] px-4 py-3 transition-all group"
              >
                <div className="text-left">
                  <p className="text-foreground/80 text-sm">{s.section_name}</p>
                  <p className="text-foreground/25 text-[11px] font-body mt-0.5">{s.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 ${s.is_visible ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {s.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                    <p className="text-foreground/25 text-[10px] mt-1">
                      {s.updated_at ? new Date(s.updated_at).toLocaleString('ru') : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
