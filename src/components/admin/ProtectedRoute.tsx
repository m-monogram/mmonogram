import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "@/pages/admin/AdminLogin";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
  /** When true, unauthenticated users see the login form instead of redirecting */
  loginFallback?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  loginFallback = false,
}: ProtectedRouteProps) {
  const { user, loading, canEdit, isAdmin } = useAuth();

  /* Закрываем от поисковиков всю ветку /admin, а не только внутренние
     страницы: robots.txt запрещает обход, но не индексацию адреса, найденного
     по внешней ссылке, а форма входа доступна без авторизации. */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow, noarchive";
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = "M-Monogram CMS";
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (loginFallback) return <AdminLogin />;
    return <Navigate to="/admin" replace />;
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white text-center px-6">
        <div>
          <h1 className="text-2xl font-display tracking-wider mb-4">ACCESS DENIED</h1>
          <p className="text-white/50 mb-6">У вас нет прав для доступа к админ-панели.</p>
          <a href="/" className="text-white/70 underline hover:text-white">
            ← Вернуться на сайт
          </a>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
