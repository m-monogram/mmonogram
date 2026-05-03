import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center luxury-bg">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-display text-accent-white">404</h1>
        <p className="mb-8 text-xl text-muted-foreground font-body">Oops! Page not found</p>
        <a href="/" className="btn-outline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
