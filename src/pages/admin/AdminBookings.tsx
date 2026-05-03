import { useState, useEffect } from 'react';
import { queryTable } from '@/lib/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import {
    Phone, Mail, Car, MessageSquare, Clock, CheckCircle,
    XCircle, AlertCircle, Loader, ChevronDown, Trash2, Search, X, StickyNote
} from 'lucide-react';

interface Booking {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    car: string | null;
    service: string | null;
    budget: string | null;
    message: string | null;
    source: string;
    status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    created_at: string;
}

const STATUS_CONFIG = {
    new: { label: 'Новая', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: AlertCircle },
    contacted: { label: 'Связались', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Phone },
    in_progress: { label: 'В работе', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Loader },
    completed: { label: 'Завершено', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
    cancelled: { label: 'Отменено', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
} as const;

const SERVICE_LABELS: Record<string, string> = {
    exterior: 'Экстерьер',
    interior: 'Интерьер',
    performance: 'Производительность',
    full: 'Полная трансформация',
};

export default function AdminBookings() {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [notesText, setNotesText] = useState('');

    const fetchBookings = async () => {
        const { data, error } = await queryTable('bookings').select('*').order('created_at', { ascending: false });
        if (error?.code === '42P01') { setNotFound(true); setLoading(false); return; }
        setBookings((data as Booking[]) ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateStatus = async (id: string, status: Booking['status']) => {
        await queryTable('bookings').update({ status }).eq('id', id);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        toast({ title: 'Статус обновлён' });
    };

    const saveNotes = async (id: string) => {
        await queryTable('bookings').update({ notes: notesText }).eq('id', id);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, notes: notesText } : b));
        setEditingNotes(null);
        toast({ title: 'Заметка сохранена' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить заявку?')) return;
        await queryTable('bookings').delete().eq('id', id);
        setBookings(prev => prev.filter(b => b.id !== id));
        toast({ title: 'Заявка удалена' });
    };

    const filtered = bookings.filter(b => {
        const matchesSearch = !search ||
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.phone.includes(search) ||
            (b.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
        acc[s] = bookings.filter(b => b.status === s).length;
        return acc;
    }, {} as Record<string, number>);

    if (notFound) {
        return (
            <div className="max-w-2xl">
                <h1 className="text-white font-display text-2xl tracking-widest uppercase mb-6">Заявки</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6">
                    <p className="text-yellow-400 text-sm mb-3">Таблица заявок не найдена в базе данных.</p>
                    <p className="text-white/40 text-xs mb-3">Запустите следующий SQL в Supabase SQL Editor:</p>
                    <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-body uppercase tracking-wider hover:bg-white/90 transition-all"
                    >
                        Открыть Supabase → SQL Editor
                    </a>
                    <p className="text-white/30 text-xs mt-4">Файл миграции: <code className="text-white/50 bg-white/5 px-1.5 py-0.5 rounded text-[11px]">supabase/migrations/20260303000000_add_bookings_table.sql</code></p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white font-display text-2xl tracking-widest uppercase">Заявки</h1>
                    <p className="text-white/40 text-sm font-body mt-1">{bookings.length} заявок всего</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-5 gap-2">
                {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                        className={`p-3 border text-left transition-all ${filterStatus === key ? cfg.color : 'bg-white/[0.03] border-white/[0.07] hover:border-white/20'}`}
                    >
                        <p className="text-lg font-display text-white">{counts[key] || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{cfg.label}</p>
                    </button>
                ))}
            </div>

            {/* Search + filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Поиск по имени, телефону, email..."
                        className="w-full bg-white/[0.03] border border-white/10 pl-10 pr-10 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {filterStatus !== 'all' && (
                    <button
                        onClick={() => setFilterStatus('all')}
                        className="flex items-center gap-1.5 px-3 py-2 text-white/40 hover:text-white border border-white/10 text-xs hover:border-white/30 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Сбросить фильтр
                    </button>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="text-white/30 text-sm">Загрузка...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/30 text-sm">
                    {search || filterStatus !== 'all' ? 'Ничего не найдено' : 'Заявок пока нет'}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(booking => {
                        const statusCfg = STATUS_CONFIG[booking.status];
                        const isExpanded = expandedId === booking.id;
                        return (
                            <div key={booking.id} className={`border transition-all ${isExpanded ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'}`}>
                                {/* Row */}
                                <div className="flex items-center gap-4 px-4 py-3">
                                    {/* Status dot */}
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${booking.status === 'new' ? 'bg-blue-400' :
                                            booking.status === 'contacted' ? 'bg-yellow-400' :
                                                booking.status === 'in_progress' ? 'bg-purple-400' :
                                                    booking.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                                        }`} />

                                    {/* Name + contact */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white text-sm font-display tracking-wide">{booking.name}</span>
                                            {booking.status === 'new' && (
                                                <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 uppercase tracking-wider">Новая</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                            <a href={`tel:${booking.phone}`} className="text-white/50 text-xs hover:text-white transition-colors flex items-center gap-1">
                                                <Phone className="w-3 h-3" />{booking.phone}
                                            </a>
                                            {booking.email && (
                                                <a href={`mailto:${booking.email}`} className="text-white/50 text-xs hover:text-white transition-colors flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />{booking.email}
                                                </a>
                                            )}
                                            {booking.car && (
                                                <span className="text-white/30 text-xs flex items-center gap-1">
                                                    <Car className="w-3 h-3" />{booking.car}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Service */}
                                    {booking.service && (
                                        <span className="text-white/40 text-xs hidden sm:block">
                                            {SERVICE_LABELS[booking.service] || booking.service}
                                        </span>
                                    )}

                                    {/* Time */}
                                    <span className="text-white/25 text-[10px] hidden md:block flex-shrink-0">
                                        {new Date(booking.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    {/* Notes indicator */}
                                    {booking.notes && (
                                        <StickyNote className="w-3.5 h-3.5 text-yellow-400/60 flex-shrink-0" />
                                    )}

                                    {/* Status select */}
                                    <div className="relative flex-shrink-0">
                                        <select
                                            value={booking.status}
                                            onChange={e => updateStatus(booking.id, e.target.value as Booking['status'])}
                                            onClick={e => e.stopPropagation()}
                                            className={`text-xs px-2 py-1 pr-6 border focus:outline-none appearance-none cursor-pointer ${statusCfg.color}`}
                                        >
                                            {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([s, c]) => (
                                                <option key={s} value={s} className="bg-[#111] text-white">{c.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current" />
                                    </div>

                                    {/* Expand */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                                        className="text-white/30 hover:text-white transition-colors"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Expanded */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-white/[0.07] space-y-3">
                                        {booking.message && (
                                            <div className="bg-white/[0.03] border border-white/[0.07] px-4 py-3">
                                                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <MessageSquare className="w-3 h-3" /> Сообщение
                                                </p>
                                                <p className="text-white/70 text-sm">{booking.message}</p>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <div>
                                            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                <StickyNote className="w-3 h-3" /> Заметки (внутренние)
                                            </p>
                                            {editingNotes === booking.id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={notesText}
                                                        onChange={e => setNotesText(e.target.value)}
                                                        rows={3}
                                                        autoFocus
                                                        className="w-full bg-white/[0.05] border border-white/20 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none"
                                                        placeholder="Внутренние заметки по клиенту..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveNotes(booking.id)} className="px-4 py-1.5 bg-white text-black text-xs uppercase tracking-wider hover:bg-white/90 transition-all">
                                                            Сохранить
                                                        </button>
                                                        <button onClick={() => setEditingNotes(null)} className="px-4 py-1.5 text-white/40 hover:text-white text-xs transition-colors">
                                                            Отмена
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setEditingNotes(booking.id); setNotesText(booking.notes || ''); }}
                                                    className="w-full text-left px-3 py-2 border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 text-sm transition-colors"
                                                >
                                                    {booking.notes || '+ Добавить заметку'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Quick actions */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <a
                                                href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-colors"
                                            >
                                                <Phone className="w-3 h-3" /> WhatsApp
                                            </a>
                                            {booking.email && (
                                                <a
                                                    href={`mailto:${booking.email}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white hover:border-white/30 transition-colors"
                                                >
                                                    <Mail className="w-3 h-3" /> Email
                                                </a>
                                            )}
                                            <div className="flex-1" />
                                            <span className="text-white/20 text-[10px] flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(booking.created_at).toLocaleString('ru')}
                                            </span>
                                            <button onClick={() => handleDelete(booking.id)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
