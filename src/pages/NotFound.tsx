import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative bg-premium-black">
      <SEOHead title="404 — Page Not Found | M-Monogram" description="Page not found" path={location.pathname} />
      <Header />
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-eyebrow mb-4">Error 404</p>
          <h1 className="h-display-1 mb-6">Page Not Found</h1>
          <p className="text-body text-muted-foreground mb-10">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/" className="btn-outline inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
