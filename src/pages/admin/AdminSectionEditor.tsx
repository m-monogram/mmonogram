import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sectionMeta } from '@/lib/defaultContent';
import { ArrowLeft, Save, Eye, EyeOff, RotateCcw, Image as ImageIcon, X, Check } from 'lucide-react';
import { defaultContent } from '@/lib/defaultContent';
import { useToast } from '@/hooks/use-toast';
import { queryTable } from '@/lib/supabase-admin';
import { supabase } from '@/integrations/supabase/client';
import type { SiteContent } from '@/lib/admin-types';

export default function AdminSectionEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [section, setSection] = useState<SiteContent | null>(null);
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const meta = id ? sectionMeta[id] : undefined;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await queryTable('site_content').select('*').eq('id', id).maybeSingle();
      if (data) {
        setSection(data as SiteContent);
        setContent((data as any).content ?? {});
        setIsVisible((data as any).is_visible ?? true);
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content, isVisible]);

  const updateField = useCallback((key: string, value: unknown) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await queryTable('site_content').update({ content, is_visible: isVisible }).eq('id', id);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Сохранено ✓' }); setHasChanges(false); }
    setSaving(false);
  };

  const handleReset = () => {
    if (!id || !defaultContent[id]) return;
    setContent(defaultContent[id]);
    setHasChanges(true);
    toast({ title: 'Сброшено к значениям по умолчанию' });
  };

  if (loading) return <div className="text-white/30">Загрузка...</div>;

  if (!section) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 mb-4">Секция &ldquo;{id}&rdquo; не найдена</p>
        <button onClick={() => navigate('/admin/sections')} className="text-white/40 hover:text-white text-sm underline">← К списку секций</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/sections')} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-display text-xl tracking-wider">{meta?.name || section.section_name}</h1>
            <p className="text-white/30 text-xs mt-0.5">{meta?.description || `ID: ${id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsVisible(!isVisible); setHasChanges(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${isVisible
                ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
              }`}
          >
            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isVisible ? 'Видна' : 'Скрыта'}
          </button>
          {defaultContent[id!] && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-colors"
              title="Сбросить к умолчаниям"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс
            </button>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 text-yellow-400 text-xs flex items-center justify-between">
          <span>Есть несохранённые изменения</span>
          <span className="text-yellow-400/40">⌘S / Ctrl+S</span>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-5">
        {meta?.fields.map((field) => (
          <FieldEditor
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            type={field.type}
            value={content[field.key]}
            onChange={(val) => updateField(field.key, val)}
          />
        ))}
        {!meta && (
          <div>
            <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">JSON контент</label>
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => { try { setContent(JSON.parse(e.target.value)); setHasChanges(true); } catch { } }}
              rows={15}
              className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-white text-sm font-mono focus:border-white/30 focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <p className="text-white/20 text-xs">
          Обновлено: {section.updated_at ? new Date(section.updated_at).toLocaleString('ru') : '—'}
        </p>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-body uppercase tracking-wider hover:bg-white/90 disabled:opacity-30 transition-all"
        >
          {saving ? <><Save className="w-4 h-4 animate-spin" /> Сохранение...</> : <><Save className="w-4 h-4" /> Сохранить</>}
        </button>
      </div>
    </div>
  );
}

// ---- Field Editors ----

interface FieldEditorProps {
  fieldKey: string;
  label: string;
  type: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldEditor({ fieldKey, label, type, value, onChange }: FieldEditorProps) {
  if (type === 'text') {
    return (
      <div>
        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">{label}</label>
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-white text-sm font-body focus:border-white/30 focus:outline-none transition-colors"
        />
      </div>
    );
  }
  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">{label}</label>
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-white text-sm font-body focus:border-white/30 focus:outline-none resize-none transition-colors"
        />
      </div>
    );
  }
  if (type === 'image') {
    return <ImageFieldEditor label={label} value={value as string} onChange={onChange} />;
  }
  if (type === 'array') {
    const items = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">{label}</label>
        <div className="space-y-2">
          {items.map((item: unknown, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={typeof item === 'string' ? item : JSON.stringify(item)}
                onChange={(e) => { const u = [...items]; u[idx] = e.target.value; onChange(u); }}
                className="flex-1 bg-white/[0.03] border border-white/10 px-3 py-2 text-white text-sm font-body focus:border-white/30 focus:outline-none transition-colors"
              />
              <button
                onClick={() => onChange(items.filter((_: unknown, i: number) => i !== idx))}
                className="px-3 text-red-400/60 hover:text-red-400 text-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, ''])}
            className="text-white/30 hover:text-white text-xs transition-colors"
          >
            + Добавить
          </button>
        </div>
      </div>
    );
  }
  if (type === 'boolean') {
    return (
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 px-4 py-3">
        <label className="text-white/50 text-sm">{label}</label>
        <button
          onClick={() => onChange(!value)}
          className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-white/20'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-5' : 'left-0.5'}`} />
        </button>
      </div>
    );
  }
  // JSON fallback
  return (
    <div>
      <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">{label}</label>
      <textarea
        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        onChange={(e) => { try { onChange(JSON.parse(e.target.value)); } catch { onChange(e.target.value); } }}
        rows={6}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-white text-sm font-mono focus:border-white/30 focus:outline-none resize-none transition-colors"
      />
    </div>
  );
}

// ---- Image Field with Media Picker ----
function ImageFieldEditor({ label, value, onChange }: { label: string; value: string; onChange: (v: unknown) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const openPicker = async () => {
    setShowPicker(true);
    setLoadingMedia(true);
    const { data } = await supabase.storage.from('images').list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
    if (data) {
      setMediaFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
        name: f.name,
        url: supabase.storage.from('images').getPublicUrl(f.name).data.publicUrl,
      })));
    }
    setLoadingMedia(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(name, file);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); }
    else {
      const url = supabase.storage.from('images').getPublicUrl(name).data.publicUrl;
      onChange(url);
      toast({ title: 'Загружено' });
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL изображения"
          className="flex-1 bg-white/[0.03] border border-white/10 px-4 py-3 text-white text-sm font-body focus:border-white/30 focus:outline-none transition-colors"
        />
        <button
          onClick={openPicker}
          className="flex items-center gap-1.5 px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-xs transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Выбрать
        </button>
        <label className="flex items-center gap-1.5 px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-xs transition-colors cursor-pointer">
          {uploading ? 'Загрузка...' : '↑ Загрузить'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {value && (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="" className="h-20 object-cover border border-white/10" />
          <button
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Media picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-white font-display text-sm tracking-wider uppercase">Медиа-библиотека</h3>
              <button onClick={() => setShowPicker(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingMedia ? (
                <div className="text-center py-12 text-white/30 text-sm">Загрузка...</div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm">Нет загруженных изображений</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {mediaFiles.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => { onChange(file.url); setShowPicker(false); }}
                      className={`relative aspect-square bg-black/50 overflow-hidden border-2 transition-all hover:border-white/50 ${value === file.url ? 'border-white' : 'border-transparent'}`}
                    >
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      {value === file.url && (
                        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
