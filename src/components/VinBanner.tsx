import { motion } from "framer-motion";
import { ShieldCheck, Phone, Building2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { BlurTextInView } from "@/components/ui/blur-text";
import { useNavigation } from "@/hooks/useNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface VinBannerProps {
  setCurrentView?: (view: string) => void;
}
const VinBanner = ({
  setCurrentView
}: VinBannerProps) => {
  const { navigateToView } = useNavigation({ setCurrentView });
  const { t } = useLanguage();
  
  return <section className="bg-black py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <h3 className="font-display text-base sm:text-lg tracking-widest text-white uppercase">
                {t("verify.title")}
              </h3>
            </div>

            {/* Short Description */}
            <p className="font-body text-caption text-white/50 leading-relaxed mb-4 max-w-sm mx-auto">
              {t("verify.shortDesc")}
            </p>

            {/* Contact Cards - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.a 
                href="tel:+971545077707" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-center gap-3 px-6 py-3.5 sm:px-8 sm:py-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 transition-all cursor-pointer rounded-none"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-white transition-colors" />
                <span className="font-body text-sm sm:text-base text-white group-hover:text-white transition-colors tracking-wider">
                  +971 54 507 7707
                </span>
              </motion.a>
              
              <motion.a 
                href="tel:+97142284177" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-center gap-3 px-6 py-3.5 sm:px-8 sm:py-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 transition-all cursor-pointer rounded-none"
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-white transition-colors" />
                <span className="font-body text-sm sm:text-base text-white group-hover:text-white transition-colors tracking-wider">
                  +971 4 228 4177
                </span>
              </motion.a>
            </div>

            {/* Full Details Link */}
            <button type="button" onClick={() => navigateToView("verify")} className="mt-6 font-body text-subtitle text-white/40 uppercase tracking-wider hover:text-white/70 transition-colors cursor-pointer underline underline-offset-4">
              {t("common.learnMore")}
            </button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>;
};
export default VinBanner;