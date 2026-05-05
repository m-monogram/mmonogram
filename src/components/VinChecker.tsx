import { ShieldCheck, Phone, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
const VinChecker = () => {
  const {
    t
  } = useLanguage();
  return <section className="min-h-screen flex items-center justify-center py-16 sm:py-20 px-4 sm:px-6 relative z-10 bg-black">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-neutral-950" />
      
      <div className="max-w-xl w-full relative z-10">
        <div className="text-center">
          {/* Shield Icon */}
          

          {/* Headline */}
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-widest mb-4 text-white uppercase">
            {t("verify.title")}
          </h1>

          {/* Short description */}
          <p className="font-body text-white/60 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-10">
            Verify your M-Monogram vehicle through our official channels.
          </p>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Hotline / Mobile */}
            <a href="tel:+971545077707" className="group block p-6 sm:p-8 rounded-none border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                <span className="font-body text-xs text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">
                  {t("verify.hotline")}
                </span>
              </div>
              <span className="font-display text-xl sm:text-2xl tracking-widest text-white group-hover:text-amber-400 transition-colors block">
                +971 54 507 7707
              </span>
            </a>

            {/* Office / Landline */}
            <a href="tel:+97142284177" className="group block p-6 sm:p-8 rounded-none border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                <span className="font-body text-xs text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">
                  {t("verify.office")}
                </span>
              </div>
              <span className="font-display text-xl sm:text-2xl tracking-widest text-white group-hover:text-amber-400 transition-colors block">
                +971 4 228 4177
              </span>
            </a>
          </div>

          {/* Trust badge */}
          <p className="mt-8 text-white/40 text-xs tracking-wider uppercase">
            Official M-Monogram Verification Service
          </p>
        </div>
      </div>
    </section>;
};
export default VinChecker;