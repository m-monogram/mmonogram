import { ShieldCheck, Phone, Building2, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const VinChecker = () => {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-24 sm:py-32 overflow-hidden bg-premium-black">
      {/* Layered atmospheric gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,255,255,0.05), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Eyebrow / Official badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-foreground/15 bg-foreground/[0.03] backdrop-blur-sm">
          <BadgeCheck className="w-3.5 h-3.5 text-foreground/70" strokeWidth={1.5} />
          <span className="font-body text-[10px] sm:text-xs text-foreground/70 uppercase tracking-[0.25em]">
            {t("verify.badge")}
          </span>
        </div>

        {/* Shield monogram */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border border-foreground/15 bg-foreground/[0.02] backdrop-blur-sm">
            <ShieldCheck className="w-7 h-7 sm:w-9 sm:h-9 text-foreground/85" strokeWidth={1.25} />
            <span className="absolute -inset-px border border-foreground/[0.06]" aria-hidden />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.08em] text-foreground uppercase leading-[1.05] mb-5">
          {t("verify.title")}
        </h1>

        {/* Decorative divider */}
        <div className="mx-auto mb-7 h-px w-24 bg-gradient-to-r from-transparent via-foreground/40 to-transparent" aria-hidden />

        {/* Description */}
        <p className="font-body text-foreground/55 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-14">
          {t("verify.descriptionLong")}
        </p>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-12">
          {/* Hotline / Mobile */}
          <a
            href="tel:+971545077707"
            className="group relative block p-7 sm:p-9 border border-foreground/10 bg-foreground/[0.025] backdrop-blur-md transition-all duration-500 hover:border-foreground/35 hover:bg-foreground/[0.06] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_30px_60px_-30px_rgba(255,255,255,0.18)]" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-center gap-2.5 mb-5">
                <Phone className="w-4 h-4 text-foreground/55 group-hover:text-foreground/90 transition-colors" strokeWidth={1.5} />
                <span className="font-body text-[10px] sm:text-xs text-foreground/55 uppercase tracking-[0.28em] group-hover:text-foreground/90 transition-colors">
                  {t("verify.hotline")}
                </span>
              </div>
              <span className="font-display text-2xl sm:text-3xl tracking-[0.12em] text-foreground block whitespace-nowrap">
                +971 54 507 7707
              </span>
              <span className="mt-3 block font-body text-[10px] uppercase tracking-[0.3em] text-foreground/35">
                {t("verify.concierge")}
              </span>
            </div>
          </a>

          {/* Office / Landline */}
          <a
            href="tel:+97142284177"
            className="group relative block p-7 sm:p-9 border border-foreground/10 bg-foreground/[0.025] backdrop-blur-md transition-all duration-500 hover:border-foreground/35 hover:bg-foreground/[0.06] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_30px_60px_-30px_rgba(255,255,255,0.18)]" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-center gap-2.5 mb-5">
                <Building2 className="w-4 h-4 text-foreground/55 group-hover:text-foreground/90 transition-colors" strokeWidth={1.5} />
                <span className="font-body text-[10px] sm:text-xs text-foreground/55 uppercase tracking-[0.28em] group-hover:text-foreground/90 transition-colors">
                  {t("verify.office")}
                </span>
              </div>
              <span className="font-display text-2xl sm:text-3xl tracking-[0.12em] text-foreground block whitespace-nowrap">
                +971 4 228 4177
              </span>
              <span className="mt-3 block font-body text-[10px] uppercase tracking-[0.3em] text-foreground/35">
                {t("verify.officeHours")}
              </span>
            </div>
          </a>
        </div>

        {/* Trust footer line */}
        <div className="flex items-center justify-center gap-4 text-foreground/35">
          <span className="h-px w-10 bg-foreground/20" aria-hidden />
          <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.32em]">
            M-Monogram · Authenticated Atelier
          </span>
          <span className="h-px w-10 bg-foreground/20" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export default VinChecker;
