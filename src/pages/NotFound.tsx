import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative bg-premium-black">
      <SEOHead title={`404 — ${t("notFound.title")} | M-Monogram`} description={t("notFound.description")} path={location.pathname} />
      <Header />
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-eyebrow mb-4">{t("notFound.error404")}</p>
          <h1 className="h-display-1 mb-6">{t("notFound.title")}</h1>
          <p className="text-body text-muted-foreground mb-10">
            {t("notFound.description")}
          </p>
          <Link to="/" className="btn-outline inline-block">
            {t("notFound.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
