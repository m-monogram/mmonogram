import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const BrandSection = lazy(() => import("@/components/BrandSection"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const BrandPage = () => {
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
        title="Brand & Projects - M-Monogram | Luxury Automotive Excellence"
        description="Discover the M-Monogram philosophy and explore our exclusive projects. Uncompromising craftsmanship and modern design."
        path="/brand"
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <BrandSection />
      </Suspense>
    </div>
  );
};

export default BrandPage;
