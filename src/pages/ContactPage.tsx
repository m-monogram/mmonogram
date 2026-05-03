import { lazy, Suspense, useState } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const ContactBookingSection = lazy(() => import("@/components/ContactBookingSection"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const ContactPage = () => {
  const [prefilledModel, setPrefilledModel] = useState("");

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
        title="Contact Us - M-Monogram | Book Your Project"
        description="Book your luxury car modification project. Contact M-Monogram in Dubai, UAE. Schedule a consultation for bespoke automotive transformations."
        path="/contact"
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ContactBookingSection prefilledModel={prefilledModel} />
      </Suspense>
    </div>
  );
};

export default ContactPage;
