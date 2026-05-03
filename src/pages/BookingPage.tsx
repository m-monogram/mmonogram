import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const BookingSection = lazy(() => import("@/components/BookingSection"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const BookingPage = () => {
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
        title="Book Your Project - M-Monogram | Schedule Consultation"
        description="Schedule a consultation for your luxury car modification project. Book your appointment with M-Monogram in Dubai, UAE."
        path="/booking"
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <BookingSection />
      </Suspense>
    </div>
  );
};

export default BookingPage;
