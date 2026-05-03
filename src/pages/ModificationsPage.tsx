import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const ModificationsSection = lazy(() => import("@/components/ModificationsSection"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const ModificationsPage = () => {
  return (
    <div className="min-h-screen relative">
      {/* Atmospheric Particles - lazy loaded */}
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>
      </Suspense>

      <Header />
      
      <SEOHead
        title="Commission - M-Monogram | Premium Vehicle Upgrades"
        description="Premium upgrades and commission services for your vehicle. Exterior, interior, forged wheels, and protection services."
        path="/commission"
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ModificationsSection />
      </Suspense>
    </div>
  );
};

export default ModificationsPage;
