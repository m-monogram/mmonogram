import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryTable } from '@/lib/supabase-admin';
import type { AppRole } from '@/lib/admin-types';

interface UserWithRole {
  user_id: string;
  role: AppRole;
  created_at: string;
}

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data } = await queryTable('user_roles').select('*');
    setUsers((data as UserWithRole[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRemoveRole = async (userId: string) => {
    if (!confirm('Удалить роль пользователя?')) return;
    const { error } = await queryTable('user_roles').delete().eq('user_id', userId);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Роль удалена' });
      fetchUsers();
    }
  };

  const handleUpdateRole = async (userId: string, role: AppRole) => {
    const { error } = await queryTable('user_roles').update({ role }).eq('user_id', userId);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Роль обновлена' });
      fetchUsers();
    }
  };

  if (!isAdmin) {
    return <div className="text-center py-20 text-foreground/50">Только администраторы могут управлять пользователями.</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-foreground font-display text-2xl tracking-widest uppercase">Пользователи</h1>
        <p className="text-foreground/40 text-sm font-body mt-1">Управление ролями пользователей</p>
      </div>
      <div className="bg-foreground/5 border border-foreground/10 p-4 text-foreground/40 text-xs font-body space-y-1">
        <p>Чтобы добавить пользователя, он должен сначала зарегистрироваться на странице /admin.</p>
        <p>Затем добавьте его роль через Supabase SQL Editor:</p>
        <code className="block mt-2 bg-black/50 p-3 text-foreground/60 font-body text-xs">
          {`INSERT INTO user_roles (user_id, role) VALUES ('user-uuid-here', 'editor');`}
        </code>
      </div>
      {loading ? (
        <div className="text-foreground/30 text-sm">Загрузка...</div>
      ) : users.length === 0 ? (
        <div className="text-foreground/30 text-sm text-center py-8">Нет пользователей с ролями</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.user_id} className="flex items-center justify-between bg-white/[0.03] border border-foreground/10 p-4">
              <div>
                <p className="text-foreground text-sm font-body truncate max-w-[300px]">{u.user_id}</p>
                <p className="text-foreground/30 text-xs mt-0.5">Добавлен: {u.created_at ? new Date(u.created_at).toLocaleDateString('ru') : '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={u.role} onChange={(e) => handleUpdateRole(u.user_id, e.target.value as AppRole)} className="bg-foreground/5 border border-foreground/10 text-foreground text-xs px-2 py-1 focus:outline-none">
                  <option value="admin">admin</option>
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                </select>
                <button onClick={() => handleRemoveRole(u.user_id)} className="text-red-400/60 hover:text-red-400 transition-colors">
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
