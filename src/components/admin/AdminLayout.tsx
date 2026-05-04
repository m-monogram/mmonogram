import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, FileText, Navigation, Image, Settings, Users,
  LogOut, Menu, X, Car, ExternalLink, Layers, MessageSquare
} from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', icon: MessageSquare, label: 'Заявки' },
  { to: '/admin/projects', icon: Car, label: 'Проекты' },
  { to: '/admin/sections', icon: Layers, label: 'Секции' },
  { to: '/admin/navigation', icon: Navigation, label: 'Навигация' },
  { to: '/admin/media', icon: Image, label: 'Медиа' },
  { to: '/admin/settings', icon: Settings, label: 'Настройки' },
  { to: '/admin/users', icon: Users, label: 'Пользователи', adminOnly: true },
];

export default function AdminLayout() {
  const { user, signOut, isAdmin, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-background border-r border-white/[0.07]
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src={logoWhite} alt="M-Monogram" className="h-7 w-auto" />
            <span className="text-foreground/60 font-display text-xs tracking-widest uppercase group-hover:text-foreground transition-colors">CMS</span>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-foreground/50 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {filteredNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-body tracking-wide transition-all duration-200 rounded-sm ${isActive
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-foreground/40 hover:text-foreground hover:bg-white/[0.05]'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Divider + View site */}
        <div className="px-2 pb-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 text-foreground/30 hover:text-foreground/70 text-xs font-body tracking-wide transition-colors rounded-sm hover:bg-white/[0.05]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Открыть сайт
          </a>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-white/[0.07]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 bg-foreground/10 flex items-center justify-center text-foreground text-xs font-display rounded-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground/70 text-xs truncate">{user?.email}</p>
              <p className="text-foreground/30 text-[10px] uppercase tracking-wider">{role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-foreground/30 hover:text-red-400 text-xs transition-colors w-full group"
          >
            <LogOut className="w-3.5 h-3.5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-white/[0.07] px-4 lg:px-8 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground/60 hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/30 hover:text-foreground text-xs font-body tracking-wide flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Сайт
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
