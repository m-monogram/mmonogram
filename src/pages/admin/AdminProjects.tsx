import { useState, useRef } from 'react';
import { useProjects, DBProject } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Copy, Trash2, Pencil, Eye, EyeOff, Upload, X, Image as ImageIcon,
  GripVertical, ExternalLink, Star, ChevronLeft
} from 'lucide-react';

// ---- Drag context for project list ----
interface DragItem { id: string; idx: number }

export default function AdminProjects() {
  const { projects, loading, refetch } = useProjects(true);
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<DBProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [orderedProjects, setOrderedProjects] = useState<DBProject[]>([]);
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const client = supabase as any;

  // Sync when projects loaded
  const displayProjects = orderedProjects.length > 0 ? orderedProjects : projects;

  const handleDragStart = (e: React.DragEvent, id: string, idx: number) => {
    setDragging({ id, idx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (!dragging || dragging.idx === idx) return;
    const updated = [...displayProjects];
    const [moved] = updated.splice(dragging.idx, 1);
    updated.splice(idx, 0, moved);
    setOrderedProjects(updated);
    setDragging({ id: dragging.id, idx });
  };

  const handleDrop = async () => {
    if (!dragging) return;
    setDragging(null);
    setSavingOrder(true);
    const updates = displayProjects.map((p, i) => client.from('projects').update({ sort_order: i }).eq('id', p.id));
    await Promise.all(updates);
    setSavingOrder(false);
    toast({ title: 'Порядок сохранён' });
  };

  const handleDuplicate = async (project: DBProject) => {
    const newSlug = `${project.slug}-copy-${Date.now().toString(36)}`;
    const { data: newProject, error } = await client
      .from('projects')
      .insert({
        slug: newSlug,
        title: project.title,
        subtitle: `${project.subtitle} (копия)`,
        year: project.year,
        duration: project.duration,
        package: project.package,
        category: project.category,
        cover_image: project.cover_image,
        description: project.description,
        modifications: project.modifications,
        specs: project.specs,
        video_url: project.video_url,
        sort_order: projects.length,
        is_published: false,
      })
      .select()
      .single();

    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); return; }

    if (project.images?.length) {
      await client.from('project_images').insert(
        project.images.map((img, idx) => ({ project_id: newProject.id, src: img.src, title: img.title, sort_order: idx }))
      );
    }

    toast({ title: 'Проект дублирован' });
    setOrderedProjects([]);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить проект и все его фото?')) return;
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Проект удалён' }); setOrderedProjects([]); refetch(); }
  };

  const togglePublished = async (project: DBProject) => {
    await client.from('projects').update({ is_published: !project.is_published }).eq('id', project.id);
    setOrderedProjects([]);
    refetch();
  };

  if (editingProject || isCreating) {
    return (
      <ProjectEditor
        project={editingProject}
        onClose={() => { setEditingProject(null); setIsCreating(false); }}
        onSaved={() => { setEditingProject(null); setIsCreating(false); setOrderedProjects([]); refetch(); }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-display text-2xl tracking-widest uppercase">Проекты</h1>
          <p className="text-foreground/40 text-sm font-body mt-1">
            {loading ? '...' : `${displayProjects.length} проектов`}
            {savingOrder && <span className="text-foreground/30 ml-2">· Сохранение порядка...</span>}
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-body uppercase tracking-wider hover:bg-foreground/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Новый проект
        </button>
      </div>

      {/* Hint */}
      {displayProjects.length > 1 && (
        <p className="text-foreground/20 text-xs flex items-center gap-1.5">
          <GripVertical className="w-3 h-3" /> Перетащите для изменения порядка
        </p>
      )}

      {loading ? (
        <div className="text-foreground/30 text-sm">Загрузка...</div>
      ) : displayProjects.length === 0 ? (
        <div className="bg-foreground/5 border border-foreground/10 p-12 text-center">
          <p className="text-foreground/50 text-sm mb-2">Нет проектов</p>
          <button onClick={() => setIsCreating(true)} className="text-foreground/30 hover:text-foreground text-xs underline transition-colors">
            Создать первый проект
          </button>
        </div>
      ) : (
        <div className="space-y-2" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          {displayProjects.map((project, idx) => (
            <div
              key={project.id}
              draggable
              onDragStart={(e) => handleDragStart(e, project.id, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              className={`flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] hover:border-foreground/20 py-3 px-4 transition-all group cursor-grab active:cursor-grabbing ${dragging?.id === project.id ? 'opacity-50 border-foreground/30' : ''}`}
            >
              {/* Drag handle */}
              <GripVertical className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 transition-colors flex-shrink-0" />

              {/* Thumbnail */}
              <div className="w-16 h-12 bg-black/50 flex-shrink-0 overflow-hidden">
                {project.cover_image ? (
                  <img src={project.cover_image} alt="" className="w-full h-full object-cover" />
                ) : project.images?.[0]?.src ? (
                  <img src={project.images[0].src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-foreground/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-foreground text-sm font-display tracking-wider truncate">{project.title}</h3>
                <p className="text-foreground/40 text-xs">{project.subtitle} · {project.year}</p>
                <p className="text-foreground/20 text-[10px] font-body mt-0.5 truncate">{project.slug} · {project.images?.length || 0} фото</p>
              </div>

              {/* Status */}
              <span className={`text-xs px-2 py-0.5 flex-shrink-0 ${project.is_published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {project.is_published ? 'Опубликован' : 'Черновик'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={`/projects/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-foreground/40 hover:text-foreground transition-colors"
                  title="Открыть на сайте"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => togglePublished(project)} className="p-2 text-foreground/40 hover:text-foreground transition-colors" title={project.is_published ? 'Скрыть' : 'Опубликовать'}>
                  {project.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditingProject(project)} className="p-2 text-foreground/40 hover:text-foreground transition-colors" title="Редактировать">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDuplicate(project)} className="p-2 text-foreground/40 hover:text-blue-400 transition-colors" title="Дублировать">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-2 text-foreground/40 hover:text-red-400 transition-colors" title="Удалить">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Project Editor ----

interface ProjectEditorProps {
  project: DBProject | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProjectEditor({ project, onClose, onSaved }: ProjectEditorProps) {
  const { toast } = useToast();
  const client = supabase as any;
  const isNew = !project;

  const [form, setForm] = useState({
    slug: project?.slug || '',
    title: project?.title || '',
    subtitle: project?.subtitle || '',
    year: project?.year || new Date().getFullYear().toString(),
    duration: project?.duration || '',
    package: project?.package || 'Full',
    category: project?.category || '',
    description: project?.description || '',
    modifications: project?.modifications || [],
    specs: project?.specs || { exterior: '', interior: '', carbon: '', spoilers: '', wheels: '', aeroKit: '' },
    video_url: project?.video_url || '',
    is_published: project?.is_published ?? false,
  });

  const [images, setImages] = useState<any[]>(project?.images || []);
  const [coverImage, setCoverImage] = useState(project?.cover_image || '');
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'specs'>('info');
  const dragRef = useRef<number | null>(null);

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploadingImages(true);

    const newImages: { src: string; title: string; sort_order: number }[] = [];

    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('project-images').upload(name, file);
      if (error) { toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' }); continue; }
      const url = supabase.storage.from('project-images').getPublicUrl(name).data.publicUrl;
      newImages.push({ src: url, title: file.name.replace(/\.[^.]+$/, ''), sort_order: images.length + newImages.length });
    }

    const updated = [...images, ...newImages as any];
    setImages(updated);
    if (!coverImage && newImages.length > 0) setCoverImage(newImages[0].src);
    setUploadingImages(false);
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    const removed = images[idx];
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    if (coverImage === removed.src) setCoverImage(updated[0]?.src || '');
  };

  // Drag-and-drop for images
  const handleImageDragStart = (idx: number) => { dragRef.current = idx; };
  const handleImageDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragRef.current === null || dragRef.current === idx) return;
    const updated = [...images];
    const [moved] = updated.splice(dragRef.current, 1);
    updated.splice(idx, 0, moved);
    setImages(updated);
    dragRef.current = idx;
  };
  const handleImageDrop = () => { dragRef.current = null; };

  const handleSave = async () => {
    if (!form.slug || !form.title) { toast({ title: 'Заполните slug и название', variant: 'destructive' }); return; }
    setSaving(true);

    const projectData = {
      slug: form.slug, title: form.title, subtitle: form.subtitle,
      year: form.year, duration: form.duration, package: form.package,
      category: form.category, cover_image: coverImage, description: form.description,
      modifications: form.modifications, specs: form.specs,
      video_url: form.video_url || null, is_published: form.is_published,
    };

    let projectId = project?.id;

    if (isNew) {
      const { data, error } = await client.from('projects').insert({ ...projectData, sort_order: 0 }).select().single();
      if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      projectId = data.id;
    } else {
      const { error } = await client.from('projects').update(projectData).eq('id', project!.id);
      if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      await client.from('project_images').delete().eq('project_id', project!.id);
    }

    if (images.length > 0) {
      await client.from('project_images').insert(
        images.map((img: any, idx: number) => ({ project_id: projectId, src: img.src, title: img.title || '', sort_order: idx }))
      );
    }

    toast({ title: isNew ? 'Проект создан' : 'Проект сохранён' });
    setSaving(false);
    onSaved();
  };

  const tabs = [
    { id: 'info', label: 'Основное' },
    { id: 'images', label: `Фото (${images.length})` },
    { id: 'specs', label: 'Характеристики' },
  ] as const;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onClose} className="text-foreground/40 hover:text-foreground transition-colors flex items-center gap-1.5 text-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-foreground font-display text-xl tracking-wider">
            {isNew ? 'Новый проект' : project.title}
          </h1>
          {!isNew && <p className="text-foreground/30 text-xs font-body mt-0.5">{project.slug}</p>}
        </div>
        {/* Published toggle */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-foreground/40 text-xs">{form.is_published ? 'Опубликован' : 'Черновик'}</span>
          <button
            onClick={() => updateField('is_published', !form.is_published)}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-green-500' : 'bg-foreground/20'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.is_published ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-foreground/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-body tracking-wide transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'text-foreground border-white' : 'text-foreground/40 border-transparent hover:text-foreground/70'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug (URL)" value={form.slug} onChange={v => updateField('slug', v)} required />
            <Field label="Название" value={form.title} onChange={v => updateField('title', v)} required />
            <Field label="Подзаголовок" value={form.subtitle} onChange={v => updateField('subtitle', v)} />
            <Field label="Год" value={form.year} onChange={v => updateField('year', v)} />
            <Field label="Срок выполнения" value={form.duration} onChange={v => updateField('duration', v)} />
            <Field label="Пакет" value={form.package} onChange={v => updateField('package', v)} />
            <Field label="Категория" value={form.category} onChange={v => updateField('category', v)} />
            <Field label="Видео URL" value={form.video_url} onChange={v => updateField('video_url', v)} />
          </div>

          <div>
            <label className="block text-foreground/40 text-xs uppercase tracking-wider mb-2">Описание</label>
            <textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              rows={5}
              className="w-full bg-white/[0.03] border border-foreground/10 px-4 py-3 text-foreground text-sm font-body focus:border-foreground/30 focus:outline-none resize-none transition-colors"
              placeholder="Описание проекта..."
            />
          </div>

          <div>
            <label className="block text-foreground/40 text-xs uppercase tracking-wider mb-2">Модификации</label>
            <div className="space-y-2">
              {form.modifications.map((mod, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={mod}
                    onChange={e => {
                      const updated = [...form.modifications];
                      updated[idx] = e.target.value;
                      updateField('modifications', updated);
                    }}
                    className="flex-1 bg-white/[0.03] border border-foreground/10 px-3 py-2 text-foreground text-sm focus:border-foreground/30 focus:outline-none transition-colors"
                  />
                  <button onClick={() => updateField('modifications', form.modifications.filter((_, i) => i !== idx))} className="px-3 text-red-400/60 hover:text-red-400 text-sm transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => updateField('modifications', [...form.modifications, ''])} className="text-foreground/30 hover:text-foreground text-xs transition-colors flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Добавить модификацию
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Images */}
      {activeTab === 'images' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-foreground/40 text-xs uppercase tracking-wider">
              {images.length > 0 ? 'Перетащите для изменения порядка' : 'Загрузите фото проекта'}
            </p>
            <label className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-body uppercase tracking-wider cursor-pointer hover:bg-foreground/90 transition-all">
              <Upload className="w-3.5 h-3.5" />
              {uploadingImages ? 'Загрузка...' : 'Загрузить фото'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
            </label>
          </div>

          {images.length === 0 ? (
            <label className="flex flex-col items-center justify-center border border-dashed border-foreground/20 p-16 text-center cursor-pointer hover:border-foreground/40 transition-colors group">
              <Upload className="w-8 h-8 text-foreground/20 group-hover:text-foreground/40 mb-3 transition-colors" />
              <p className="text-foreground/30 text-sm">Нажмите для загрузки или перетащите файлы</p>
              <p className="text-foreground/20 text-xs mt-1">PNG, JPG, WEBP</p>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img: any, idx: number) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleImageDragStart(idx)}
                  onDragOver={(e) => handleImageDragOver(e, idx)}
                  onDrop={handleImageDrop}
                  className={`relative group aspect-square bg-black/50 overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${coverImage === img.src ? 'border-white' : 'border-transparent hover:border-foreground/30'
                    }`}
                >
                  <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCoverImage(img.src)}
                      className={`p-2 ${coverImage === img.src ? 'bg-foreground/30 text-yellow-300' : 'bg-foreground/10 hover:bg-foreground/20 text-foreground'} transition-colors`}
                      title="Сделать обложкой"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeImage(idx)} className="p-2 bg-foreground/10 hover:bg-red-500/40 text-foreground transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {coverImage === img.src && (
                    <div className="absolute top-1 left-1 bg-white text-black text-[8px] px-1.5 py-0.5 font-body uppercase tracking-wider">
                      Cover
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/60 text-foreground/50 text-[9px] rounded px-1">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Specs */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(form.specs).map(([key, value]) => (
            <Field
              key={key}
              label={key}
              value={value as string}
              onChange={v => updateField('specs', { ...form.specs, [key]: v })}
            />
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-foreground/10">
        <button onClick={onClose} className="px-4 py-2 text-foreground/40 hover:text-foreground text-sm transition-colors">
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-body uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-30 transition-all"
        >
          {saving ? 'Сохранение...' : isNew ? 'Создать проект' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, required,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-foreground/40 text-xs uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-foreground/10 px-3 py-2 text-foreground text-sm font-body focus:border-foreground/30 focus:outline-none transition-colors"
      />
    </div>
  );
}
