import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Car, Wrench, User, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { submitLead } from "@/lib/leads";

/* Код сборки из 3D-конфигуратора (?build=…) — только цифры и дефисы */
const getBuildFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("build");
  return raw && /^[0-9-]{1,32}$/.test(raw) ? raw : null;
};

const emptyForm = {
  name: "",
  phone: "",
  car: "",
  service: "",
  message: "",
};

const BookingForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(() => {
    const build = getBuildFromUrl();
    return {
      ...emptyForm,
      car: build ? "Mercedes G-Class — 3D Studio build" : "",
      message: build
        ? `3D Studio: ${window.location.origin}/configurator?c=${build}`
        : "",
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await submitLead({
      name: formData.name,
      phone: formData.phone,
      car: formData.car,
      service: formData.service,
      message: formData.message || null,
      source: "booking",
      page: "/booking",
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "phone") setError(t("booking.errorPhone"));
      else if (result.error === "name") setError(t("booking.errorName"));
      else setError(t("booking.errorGeneric"));
      return;
    }

    setSubmitted(true);
    setFormData(emptyForm);
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center py-20 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full glass-panel p-8 sm:p-10 text-center"
        >
          <div className="w-14 h-14 mx-auto mb-5 border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-widest text-foreground mb-3">
            {t("booking.successTitle")}
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-8">{t("booking.successBody")}</p>
          <button type="button" onClick={() => setSubmitted(false)} className="btn-primary text-sm">
            {t("booking.sendAnother")}
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-luxury mb-3">
            {t("booking.title")}
          </h1>
          <p className="font-body text-muted-foreground text-xs sm:text-sm">{t("booking.subtitle")}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-panel p-6 sm:p-8"
        >
          <div className="space-y-4 sm:space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={submitting}
                className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base disabled:opacity-60"
                placeholder={t("contact.namePlaceholder")}
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={submitting}
                className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base disabled:opacity-60"
                placeholder={t("contact.phonePlaceholder")}
              />
            </div>

            <div className="relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                name="car"
                value={formData.car}
                onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                required
                disabled={submitting}
                className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base disabled:opacity-60"
              >
                <option value="">{t("contact.carPlaceholder")}</option>
                <option value="Mercedes-Benz G63 AMG">Mercedes-Benz G63 AMG</option>
                <option value="Mercedes-Maybach GLS 600">Mercedes-Maybach GLS 600</option>
                <option value="Mercedes-Benz S-Class">Mercedes-Benz S-Class</option>
                <option value="Mercedes-AMG GT">Mercedes-AMG GT</option>
                <option value="Mercedes G-Class — 3D Studio build">
                  Mercedes G-Class — 3D Studio build
                </option>
                <option value={t("common.other")}>{t("common.other")}</option>
              </select>
            </div>

            <div className="relative">
              <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                name="service"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
                disabled={submitting}
                className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base disabled:opacity-60"
              >
                <option value="">{t("contact.servicePlaceholder")}</option>
                <option value="exterior">{t("contact.exteriorPackage")}</option>
                <option value="interior">{t("contact.interiorPackage")}</option>
                <option value="performance">{t("contact.performancePackage")}</option>
                <option value="full">{t("contact.fullTransformation")}</option>
              </select>
            </div>

            <textarea
              name="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              disabled={submitting}
              className="w-full bg-input border border-border px-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 resize-none text-sm sm:text-base disabled:opacity-60"
              placeholder={t("contact.messagePlaceholder")}
            />
          </div>

          {error && <p className="mt-4 text-red-400 text-xs font-body">{error}</p>}

          <button
            type="submit"
            disabled={
              submitting ||
              !formData.name ||
              !formData.phone ||
              !formData.car ||
              !formData.service
            }
            className="w-full mt-6 flex items-center justify-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <MessageCircle className="w-4 h-4" />
            {submitting ? t("booking.submitting") : t("booking.submit")}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default BookingForm;
