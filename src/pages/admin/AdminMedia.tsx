import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Copy, Check, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  name: string;
  url: string;
  created_at: string;
  size?: number;
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AdminMedia() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from('images').list('', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (data) {
      setFiles(data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
          name: f.name,
          url: supabase.storage.from('images').getPublicUrl(f.name).data.publicUrl,
          created_at: f.created_at || '',
          size: (f.metadata as any)?.size,
        })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    let uploaded = 0;

    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(name, file);
      if (error) { toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' }); }
      else { uploaded++; }
    }

    await fetchFiles();
    setUploading(false);
    if (uploaded > 0) toast({ title: `${uploaded} ${uploaded === 1 ? 'файл загружен' : 'файлов загружено'}` });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleDelete = async (name: string) => {
    if (!confirm('Удалить файл?')) return;
    const { error } = await supabase.storage.from('images').remove([name]);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); }
    else {
      setFiles(prev => prev.filter(f => f.name !== name));
      if (preview?.name === name) setPreview(null);
      toast({ title: 'Удалено' });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'URL скопирован' });
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-display text-2xl tracking-widest uppercase">Медиа</h1>
          <p className="text-foreground/40 text-sm font-body mt-1">{files.length} файлов в библиотеке</p>
        </div>
        <label className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-body uppercase tracking-wider cursor-pointer hover:bg-foreground/90 transition-all">
          <Upload className="w-4 h-4" />
          {uploading ? 'Загрузка...' : 'Загрузить'}
          <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени..."
          className="w-full bg-white/[0.03] border border-foreground/10 pl-10 pr-4 py-2.5 text-foreground text-sm font-body placeholder:text-foreground/30 focus:border-foreground/30 focus:outline-none transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      {files.length > 0 && (
        <div
          className={`border-2 border-dashed text-center py-5 transition-colors cursor-default ${isDraggingOver ? 'border-foreground/50 bg-foreground/5 text-foreground/70' : 'border-foreground/10 text-foreground/20'
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-5 h-5 mx-auto mb-1" />
          <p className="text-xs">Перетащите файлы сюда для загрузки</p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-foreground/30 text-sm">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-20 border-2 border-dashed transition-colors ${isDraggingOver ? 'border-foreground/30 bg-foreground/5' : 'border-foreground/10'
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-foreground/20 mb-3" />
          <p className="text-foreground/30 text-sm mb-1">{search ? 'Ничего не найдено' : 'Нет загруженных файлов'}</p>
          <p className="text-foreground/20 text-xs">Перетащите изображения сюда</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {filtered.map((file) => (
            <div
              key={file.name}
              className="group bg-white/[0.03] border border-white/[0.07] hover:border-foreground/20 transition-colors overflow-hidden cursor-pointer"
              onClick={() => setPreview(file)}
            >
              <div className="aspect-square bg-black/50 relative overflow-hidden">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                    className="p-2 bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors"
                    title="Копировать URL"
                  >
                    {copied === file.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                    className="p-2 bg-foreground/10 hover:bg-red-500/40 text-foreground transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="px-2 py-1.5">
                <p className="text-foreground/40 text-[10px] font-body truncate">{file.name}</p>
                {file.size && <p className="text-foreground/20 text-[9px] mt-0.5">{formatBytes(file.size)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={preview.url} alt={preview.name} className="w-full max-h-[75vh] object-contain" />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-foreground/70 text-sm font-body truncate">{preview.name}</p>
                {preview.size && <p className="text-foreground/30 text-xs mt-0.5">{formatBytes(preview.size)}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyUrl(preview.url)}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground text-xs transition-colors"
                >
                  {copied === preview.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Копировать URL
                </button>
                <button
                  onClick={() => { handleDelete(preview.name); setPreview(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить
                </button>
                <button onClick={() => setPreview(null)} className="p-2 text-foreground/40 hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
