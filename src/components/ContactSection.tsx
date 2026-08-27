import { useState } from "react";
import { Phone, MessageCircle, Send, MapPin, Clock, Mail, Instagram, Youtube, CheckCircle2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { buildWhatsAppUrl, safeOpenUrl, safeCall } from "@/lib/validation";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { submitLead } from "@/lib/leads";
import { useLeadGuard } from "@/components/LeadGuard";

const ContactSection = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { trap, trapValue, isAutomated } = useLeadGuard();

  const whatsappNumber = "971545077707";
  const phoneNumber = "+971 54 507 7707";
  const email = "m_monogram@mail.ru";
  const address = "Dubai, UAE, Al Quoz Industrial Area 3";
  const workHours = "Mon-Sat: 9AM - 7PM";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    /* Боту показываем ровно то же, что человеку, но заявку не отправляем. */
    if (isAutomated()) {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);

    const result = await submitLead({
      companyWebsite: trapValue,
      name: formData.name,
      phone: formData.phone,
      message: formData.message || null,
      source: "contact",
      page: "/contact",
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "phone") setError(t("booking.errorPhone"));
      else if (result.error === "name") setError(t("booking.errorName"));
      else setError(t("booking.errorGeneric"));
      return;
    }

    setFormData({ name: "", phone: "", message: "" });
    setSubmitted(true);
  };

  const handleWhatsApp = () => {
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, "Hello M-Monogram!");
    if (whatsappUrl) {
      safeOpenUrl(whatsappUrl, ['https://wa.me/']);
    }
  };

  const handleCall = () => {
    safeCall(whatsappNumber);
  };

  return (
    <AuroraBackground id="contact" className="py-16 sm:py-20 md:py-32" intensity="subtle" showRadialGradient={true}>
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <ScrollReveal className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl uppercase tracking-luxury mb-3 sm:mb-4">
              {t('nav.contact')}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Info */}
            <ScrollReveal direction="left" delay={0.1} className="space-y-6">
              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border hover:border-foreground/50 transition-all duration-300 p-5 sm:p-6 contact-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-foreground/5 border border-border flex items-center justify-center">
                      <Phone className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="font-body text-caption uppercase tracking-wide text-muted-foreground">{t('contact.callUs')}</span>
                  </div>
                  <p className="font-display text-lg sm:text-xl">{phoneNumber}</p>
                </div>

                <div className="bg-card border border-border hover:border-foreground/50 transition-all duration-300 p-5 sm:p-6 contact-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-foreground/5 border border-border flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="font-body text-caption uppercase tracking-wide text-muted-foreground">WhatsApp</span>
                  </div>
                  <p className="font-display text-lg sm:text-xl">{phoneNumber}</p>
                </div>

                <div className="bg-card border border-border hover:border-foreground/50 transition-all duration-300 p-5 sm:p-6 contact-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-foreground/5 border border-border flex items-center justify-center">
                      <Mail className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="font-body text-caption uppercase tracking-wide text-muted-foreground">{t('contact.emailUs')}</span>
                  </div>
                  <p className="font-display text-base sm:text-lg">{email}</p>
                </div>

                <div className="bg-card border border-border hover:border-foreground/50 transition-all duration-300 p-5 sm:p-6 contact-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-foreground/5 border border-border flex items-center justify-center">
                      <Clock className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="font-body text-caption uppercase tracking-wide text-muted-foreground">{t('verify.hotline')}</span>
                  </div>
                  <p className="font-display text-base sm:text-lg">{workHours}</p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-card border border-border hover:border-foreground/50 transition-all duration-300 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-foreground/5 border border-border flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <span className="font-body text-caption uppercase tracking-wide text-muted-foreground block mb-2">{t('contact.location')}</span>
                    <p className="font-display text-base sm:text-lg">{address}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 social-links">
                <a
                  href="https://instagram.com/m_monogram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-card border border-border hover:border-foreground transition-all duration-300"
                >
                  <Instagram className="w-5 h-5 text-foreground" />
                  <span className="font-body text-subtitle uppercase tracking-wide">Instagram</span>
                </a>
                <a
                  href="https://www.youtube.com/@alex_meta?si=ukxmVuHe3xM9EMgD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-card border border-border hover:border-foreground transition-all duration-300"
                >
                  <Youtube className="w-5 h-5 text-foreground" />
                  <span className="font-body text-subtitle uppercase tracking-wide">YouTube</span>
                </a>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal direction="right" delay={0.2}>
              {submitted ? (
                <div className="bg-card border border-border p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                  <h3 className="font-display text-lg uppercase tracking-widest mb-2">{t("booking.successTitle")}</h3>
                  <p className="font-body text-sm text-muted-foreground mb-6">{t("booking.successBody")}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-primary text-sm"
                  >
                    {t("booking.sendAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative space-y-4 sm:space-y-6">
                  {trap}
                  <div>
                    <label className="block font-body text-caption uppercase tracking-wide text-muted-foreground mb-2">
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full bg-input border border-border px-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base disabled:opacity-60"
                      placeholder={t('contact.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block font-body text-caption uppercase tracking-wide text-muted-foreground mb-2">
                      {t('contact.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full bg-input border border-border px-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base disabled:opacity-60"
                      placeholder={t('contact.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block font-body text-caption uppercase tracking-wide text-muted-foreground mb-2">
                      {t('contact.message')}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      disabled={submitting}
                      className="w-full bg-input border border-border px-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base resize-none disabled:opacity-60"
                      placeholder={t('contact.messagePlaceholder')}
                    />
                  </div>

                  {error && <p className="text-red-400 text-xs font-body">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting || !formData.name || !formData.phone}
                    className="w-full flex items-center justify-center gap-2 btn-primary text-sm sm:text-base disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? t("booking.submitting") : t('contact.submit')}
                  </button>
                </form>
              )}

              <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-secondary border border-foreground/30 text-foreground font-body uppercase tracking-wide text-xs sm:text-sm hover:bg-foreground/10 hover:border-foreground transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={handleCall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-secondary border border-foreground/30 text-foreground font-body uppercase tracking-wide text-xs sm:text-sm hover:bg-foreground/10 hover:border-foreground transition-all duration-300"
                >
                  <Phone className="w-4 h-4" />
                  {t('contact.callUs')}
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </AuroraBackground>
  );
};

export default ContactSection;
