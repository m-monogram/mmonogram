import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import HeroSection from "@/components/HeroSection";
import MissionStatement from "@/components/MissionStatement";
import BrandStrip from "@/components/BrandStrip";
import VinBanner from "@/components/VinBanner";
import NextSectionCTA from "@/components/NextSectionCTA";
import SEOHead from "@/components/SEOHead";
import { useNavigate, useLocation } from "react-router-dom";

// Lazy load below-the-fold sections for faster initial render
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));
const LatestAdditionsCarousel = lazy(() => import("@/components/sections/latest-additions-carousel"));
const AboutUsSection = lazy(() => import("@/components/AboutUsSection"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const Footer = lazy(() => import("@/components/Footer"));

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Only show loading screen on initial page load (not on navigation)
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsLoading(false);
    } else {
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  useEffect(() => {
    // Reset loading when navigating to home from other pages
    if (location.pathname === "/" && !isLoading) {
      setIsLoading(false);
    }
  }, [location.pathname, isLoading]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  const handleSetCurrentView = useCallback((view: string) => {
    const viewToPath: Record<string, string> = {
      "home": "/",
      "brand": "/brand",
      "projects": "/projects",
      "modifications": "/modifications",
      "verify": "/verify",
      "contact": "/contact",
      "booking": "/booking",
    };
    const path = viewToPath[view] || "/";
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [navigate]);

  const handleNavigateToProjects = useCallback(() => {
    handleSetCurrentView("projects");
  }, [handleSetCurrentView]);

  const handleNavigateToBrand = useCallback(() => {
    handleSetCurrentView("brand");
  }, [handleSetCurrentView]);

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* Atmospheric Particles - lazy loaded */}
          <Suspense fallback={null}>
            <div className="fixed inset-0 z-0 pointer-events-none">
              <ParticleBackground />
            </div>
          </Suspense>

          <Header />

          <SEOHead
            title="M-Monogram - Luxury Car Modification & Customization Services in UAE"
            description="Elite G900 customization studio in Dubai. Bespoke Maybach & Brabus modifications for Mercedes G-Class. Luxury car modification and customization services in the UAE."
            path="/"
          />

          <HeroSection />
          <MissionStatement
            onNavigateToProjects={handleNavigateToProjects}
            onNavigateToBrand={handleNavigateToBrand}
          />
          <Suspense fallback={null}>
            <LatestAdditionsCarousel
              onProjectClick={handleProjectClick}
              limit={6}
            />
          </Suspense>
          <Suspense fallback={null}>
            <AboutUsSection />
          </Suspense>
          <BrandStrip />
          <Suspense fallback={null}>
            <StatsSection />
          </Suspense>
          <NextSectionCTA
            label="Explore"
            nextLabel="The M-Monogram Story"
            onClick={() => handleSetCurrentView("brand")}
          />
          <VinBanner />
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default HomePage;
