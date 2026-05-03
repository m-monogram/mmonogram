import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const VinChecker = lazy(() => import("@/components/VinChecker"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const VerifyPage = () => {
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
        title="VIN Verification - M-Monogram | Verify Your Commission"
        description="Verify your vehicle's authenticity and specifications with M-Monogram VIN checker. Ensure your luxury vehicle meets our standards."
        path="/verify"
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <VinChecker />
      </Suspense>
    </div>
  );
};

export default VerifyPage;
