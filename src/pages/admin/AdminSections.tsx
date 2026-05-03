import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pencil } from 'lucide-react';
import { queryTable } from '@/lib/supabase-admin';
import type { SiteContent } from '@/lib/admin-types';

export default function AdminSections() {
  const [sections, setSections] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await queryTable('site_content')
        .select('*')
        .order('section_name');
      setSections((data as SiteContent[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const toggleVisibility = async (id: string, visible: boolean) => {
    await queryTable('site_content')
      .update({ is_visible: !visible })
      .eq('id', id);
    setSections(prev => prev.map(s => s.id === id ? { ...s, is_visible: !visible } : s));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-display text-2xl tracking-widest uppercase">Секции сайта</h1>
        <p className="text-white/40 text-sm font-body mt-1">Редактируйте контент каждой секции</p>
      </div>

      {loading ? (
        <div className="text-white/30">Загрузка...</div>
      ) : sections.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-8 text-center">
          <p className="text-white/50 text-sm mb-2">Секции не найдены</p>
          <p className="text-white/30 text-xs">Запустите SQL-миграцию в Supabase SQL Editor</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between bg-white/[0.03] border border-white/10 hover:border-white/20 p-5 transition-colors group"
            >
              <div className="flex-1">
                <h3 className="text-white text-sm font-display tracking-wider">{section.section_name}</h3>
                <p className="text-white/30 text-xs font-mono mt-0.5">{section.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVisibility(section.id, section.is_visible)}
                  className={`p-2 transition-colors ${section.is_visible ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}
                  title={section.is_visible ? 'Скрыть секцию' : 'Показать секцию'}
                >
                  {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Link to={`/admin/sections/${section.id}`} className="p-2 text-white/40 hover:text-white transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
