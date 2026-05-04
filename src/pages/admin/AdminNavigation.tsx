import { useState, useEffect, useRef } from 'react';
import { GripVertical, Plus, Trash2, Eye, EyeOff, Save, ExternalLink, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryTable } from '@/lib/supabase-admin';
import type { NavigationItem } from '@/lib/admin-types';

type Location = 'header' | 'footer';

export default function AdminNavigation() {
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Location>('header');
  const [savingAll, setSavingAll] = useState(false);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const dragIdx = useRef<number | null>(null);

  const fetchItems = async () => {
    const { data } = await queryTable('navigation_items').select('*').order('sort_order');
    setItems((data as NavigationItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = items.filter(i => i.location === activeTab);

  // Drag-and-drop reorder
  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, absoluteIdx: number) => {
    e.preventDefault();
    if (dragIdx.current === null) return;
    // build filtered index map
    const filtered = items.map((item, i) => ({ item, i })).filter(({ item }) => item.location === activeTab);
    const fromFilteredIdx = filtered.findIndex(({ i }) => i === dragIdx.current);
    const toFilteredIdx = filtered.findIndex(({ i }) => i === absoluteIdx);
    if (fromFilteredIdx === -1 || toFilteredIdx === -1 || fromFilteredIdx === toFilteredIdx) return;

    const newItems = [...items];
    const fromAbsolute = filtered[fromFilteredIdx].i;
    const toAbsolute = filtered[toFilteredIdx].i;
    const [moved] = newItems.splice(fromAbsolute, 1);
    newItems.splice(toAbsolute, 0, moved);
    // Update sort_order for all filtered items
    const newFilteredIds = newItems.filter(i => i.location === activeTab).map(i => i.id);
    const updatedItems = newItems.map(item => {
      if (item.location !== activeTab) return item;
      const newOrder = newFilteredIds.indexOf(item.id);
      return { ...item, sort_order: newOrder };
    });
    setItems(updatedItems);
    dragIdx.current = toAbsolute;
    setChanged(prev => new Set([...prev, ...filteredItems.map(i => i.id)]));
  };

  const handleDrop = () => { dragIdx.current = null; };

  const handleAdd = async () => {
    const maxOrder = filteredItems.reduce((max, i) => Math.max(max, i.sort_order), -1);
    const { data, error } = await queryTable('navigation_items').insert({
      label: 'Новая ссылка', href: '/', location: activeTab, sort_order: maxOrder + 1, is_visible: true,
    }).select().single();
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); return; }
    setItems(prev => [...prev, data as NavigationItem]);
  };

  const handleUpdate = (id: string, field: string, value: unknown) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    setChanged(prev => new Set([...prev, id]));
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    const toSave = items.filter(i => changed.has(i.id));
    await Promise.all(
      toSave.map(item =>
        queryTable('navigation_items')
          .update({ label: item.label, href: item.href, sort_order: item.sort_order, is_visible: item.is_visible })
          .eq('id', item.id)
      )
    );
    setSavingAll(false);
    setChanged(new Set());
    toast({ title: `Сохранено ${toSave.length} пунктов` });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить пункт меню?')) return;
    await queryTable('navigation_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setChanged(prev => { prev.delete(id); return new Set(prev); });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-display text-2xl tracking-widest uppercase">Навигация</h1>
          <p className="text-foreground/40 text-sm font-body mt-1">Управление меню сайта</p>
        </div>
        <div className="flex items-center gap-2">
          {changed.size > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={savingAll}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-body uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {savingAll ? 'Сохранение...' : `Сохранить (${changed.size})`}
            </button>
          )}
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-foreground/10 border border-foreground/10 text-foreground text-xs font-body uppercase tracking-wider hover:bg-foreground/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-foreground/10">
        {(['header', 'footer'] as Location[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 text-sm font-body uppercase tracking-wider transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-foreground border-white' : 'text-foreground/40 border-transparent hover:text-foreground/70'}`}>
            {tab === 'header' ? '🔝 Заголовок' : '🔽 Подвал'}
          </button>
        ))}
      </div>

      {/* Hint */}
      {filteredItems.length > 1 && (
        <p className="text-foreground/20 text-xs flex items-center gap-1.5">
          <GripVertical className="w-3 h-3" /> Перетащите для изменения порядка
        </p>
      )}

      {loading ? (
        <div className="text-foreground/30 text-sm">Загрузка...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 text-foreground/30 text-sm border border-dashed border-foreground/10">
          <p>Нет пунктов меню</p>
          <button onClick={handleAdd} className="mt-2 text-foreground/40 hover:text-foreground text-xs underline transition-colors">
            Добавить первый пункт
          </button>
        </div>
      ) : (
        <div className="space-y-1.5" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          {items.map((item, absoluteIdx) => {
            if (item.location !== activeTab) return null;
            const isDirty = changed.has(item.id);
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => { handleDragStart(absoluteIdx); dragIdx.current = absoluteIdx; }}
                onDragOver={e => handleDragOver(e, absoluteIdx)}
                className={`flex items-center gap-2.5 border p-3 transition-all group ${isDirty ? 'border-yellow-500/30 bg-yellow-500/[0.03]' : 'border-white/[0.07] bg-white/[0.02] hover:border-foreground/15'} cursor-grab active:cursor-grabbing`}
              >
                <GripVertical className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 transition-colors flex-shrink-0" />

                {/* Visibility */}
                <button
                  onClick={() => handleUpdate(item.id, 'is_visible', !item.is_visible)}
                  className={`flex-shrink-0 ${item.is_visible ? 'text-green-400/70 hover:text-green-400' : 'text-red-400/70 hover:text-red-400'} transition-colors`}
                  title={item.is_visible ? 'Видна' : 'Скрыта'}
                >
                  {item.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Label */}
                <input
                  type="text"
                  value={item.label}
                  onChange={e => handleUpdate(item.id, 'label', e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent hover:border-foreground/20 focus:border-foreground/40 px-1 py-0.5 text-foreground text-sm focus:outline-none transition-colors"
                  placeholder="Название ссылки"
                />

                {/* Href */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="text"
                    value={item.href}
                    onChange={e => handleUpdate(item.id, 'href', e.target.value)}
                    className="w-36 bg-transparent border-b border-transparent hover:border-foreground/20 focus:border-foreground/40 px-1 py-0.5 text-foreground/50 text-xs font-body focus:outline-none transition-colors"
                    placeholder="/путь или https://..."
                  />
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/20 hover:text-foreground/60 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Delete */}
                <button onClick={() => handleDelete(item.id)} className="text-foreground/20 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Save bar */}
      {changed.size > 0 && (
        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
          <p className="text-yellow-400 text-xs">Есть несохранённые изменения ({changed.size})</p>
          <button
            onClick={handleSaveAll}
            disabled={savingAll}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black text-xs font-body uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            {savingAll ? 'Сохранение...' : 'Сохранить всё'}
          </button>
        </div>
      )}
    </div>
  );
}
