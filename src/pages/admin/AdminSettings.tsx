import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryTable } from '@/lib/supabase-admin';
import type { SiteSetting } from '@/lib/admin-types';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, unknown>>({});

  useEffect(() => {
    (async () => {
      const { data } = await queryTable('site_settings').select('*').order('key');
      setSettings((data as SiteSetting[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(changes)) {
      await queryTable('site_settings').update({ value: JSON.stringify(value) }).eq('key', key);
    }
    toast({ title: 'Настройки сохранены' });
    setChanges({});
    setSaving(false);
  };

  const getValue = (setting: SiteSetting) => {
    if (setting.key in changes) return changes[setting.key] as string;
    const val = setting.value;
    return typeof val === 'string' ? val : JSON.stringify(val);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-foreground font-display text-2xl tracking-widest uppercase">Настройки</h1>
        <p className="text-foreground/40 text-sm font-body mt-1">Общие настройки сайта</p>
      </div>
      {loading ? (
        <div className="text-foreground/30 text-sm">Загрузка...</div>
      ) : settings.length === 0 ? (
        <div className="bg-foreground/5 border border-foreground/10 p-8 text-center text-foreground/30 text-sm">Настройки не найдены. Запустите SQL-миграцию.</div>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="bg-white/[0.03] border border-foreground/10 p-5">
              <label className="block text-foreground/50 text-xs uppercase tracking-wider mb-1">{setting.key}</label>
              {setting.description && <p className="text-foreground/20 text-xs mb-2">{setting.description}</p>}
              <input type="text" value={getValue(setting)} onChange={(e) => updateSetting(setting.key, e.target.value)} className="w-full bg-foreground/5 border border-foreground/10 px-4 py-2.5 text-foreground text-sm font-body focus:border-foreground/30 focus:outline-none transition-colors" />
            </div>
          ))}
        </div>
      )}
      {Object.keys(changes).length > 0 && (
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-body uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-30 transition-all">
          <Save className="w-4 h-4" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      )}
    </div>
  );
}
