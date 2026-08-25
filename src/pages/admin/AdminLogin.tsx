import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logoWhite from "@/assets/logo-white.webp";
import { z } from "zod";

const emailSchema = z.string().email("Некорректный email");
const passwordSchema = z.string().min(6, "Минимум 6 символов");

export default function AdminLogin() {
  const { user, loading, canEdit, signIn, resetPassword } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [awaitingRole, setAwaitingRole] = useState(false);

  useEffect(() => {
    if (!awaitingRole || loading) return;
    if (user && !canEdit) {
      setError("У аккаунта нет роли admin/editor. Попросите администратора выдать доступ.");
      setAwaitingRole(false);
    }
  }, [awaitingRole, loading, user, canEdit]);

  if (!loading && user && canEdit) {
    const dest =
      location.pathname === "/admin" || location.pathname === "/admin/"
        ? "/admin/dashboard"
        : location.pathname;
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      emailSchema.parse(email);
      if (!isForgot) passwordSchema.parse(password);
    } catch (err: unknown) {
      const zodErr = err as { errors?: { message?: string }[] };
      setError(zodErr.errors?.[0]?.message || "Проверьте данные");
      return;
    }

    setSubmitting(true);

    try {
      if (isForgot) {
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(resetError.message);
        } else {
          setSuccess("Ссылка для сброса пароля отправлена на email");
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError("Неверный email или пароль");
        } else {
          setAwaitingRole(true);
        }
      }
    } catch {
      setError("Произошла ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src={logoWhite} alt="M-Monogram" className="h-16 mx-auto mb-4" />
          <h1 className="font-display text-lg tracking-widest text-foreground uppercase">
            {isForgot ? "Сброс пароля" : "Админ-панель"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-foreground/5 border border-foreground/10 pl-10 pr-4 py-3 text-foreground text-sm font-body placeholder:text-foreground/30 focus:border-foreground/30 focus:outline-none transition-colors"
            />
          </div>

          {!isForgot && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="w-full bg-foreground/5 border border-foreground/10 pl-10 pr-10 py-3 text-foreground text-sm font-body placeholder:text-foreground/30 focus:border-foreground/30 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-xs font-body">{error}</p>}
          {success && <p className="text-green-400 text-xs font-body">{success}</p>}

          <button
            type="submit"
            disabled={submitting || awaitingRole}
            className="w-full py-3 bg-white text-black text-sm font-body uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 transition-all"
          >
            {submitting || awaitingRole ? "..." : isForgot ? "Отправить ссылку" : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => {
              setIsForgot(!isForgot);
              setError("");
              setSuccess("");
            }}
            className="text-foreground/30 hover:text-foreground/60 text-xs font-body block mx-auto transition-colors"
          >
            {isForgot ? "← Назад к входу" : "Забыли пароль?"}
          </button>
        </div>

        <div className="mt-10 text-center">
          <a href="/" className="text-foreground/20 hover:text-foreground/50 text-xs transition-colors">
            ← На сайт
          </a>
        </div>
      </div>
    </div>
  );
}
