import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useNavigation } from "@/hooks/useNavigation";
import BookingForm from "@/components/BookingForm";

interface BookingSectionProps {
  setCurrentView?: (view: string) => void;
}

/**
 * Booking page with form integration
 */
const BookingSection = memo(({ setCurrentView }: BookingSectionProps) => {
  const { t } = useLanguage();
  const { navigateToView } = useNavigation({ setCurrentView });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <AuroraBackground className="min-h-screen pt-32" intensity="subtle" showRadialGradient={true}>
      <div className="relative z-10">
      {/* Back Button - positioned below logo */}
      <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}>
        <button
          type="button"
          onClick={() => navigateToView("home")}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50 backdrop-blur-md rounded-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Booking Form */}
      <BookingForm />
      </div>
    </AuroraBackground>
  );
});

BookingSection.displayName = "BookingSection";

export default BookingSection;
