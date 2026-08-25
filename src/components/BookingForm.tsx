import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Car, Wrench, User } from "lucide-react";
import { buildWhatsAppUrl, safeOpenUrl, sanitizeText } from "@/lib/validation";
import { useLanguage } from "@/contexts/LanguageContext";

/* Код сборки из 3D-конфигуратора (?build=1-0-1-0-1-1-0-0) — только цифры и дефисы */
const getBuildFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("build");
  return raw && /^[0-9-]{1,32}$/.test(raw) ? raw : null;
};

const BookingForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(() => {
    const build = getBuildFromUrl();
    return {
      name: "",
      phone: "",
      car: build ? "Mercedes G-Class — 3D Studio build" : "",
      service: "",
      message: build ? `3D Studio: ${window.location.origin}/configurator?c=${build}` : ""
    };
  });
  const whatsappNumber = "971545077707";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize all user inputs
    const sanitizedName = sanitizeText(formData.name, 100);
    const sanitizedPhone = sanitizeText(formData.phone, 20);
    const sanitizedCar = sanitizeText(formData.car, 100);
    const sanitizedService = sanitizeText(formData.service, 100);
    const sanitizedMessage = sanitizeText(formData.message, 500);
    
    const message = `Здравствуйте, M-Monogram!

Имя: ${sanitizedName}
Телефон: ${sanitizedPhone}
Автомобиль: ${sanitizedCar}
Услуга: ${sanitizedService}
${sanitizedMessage ? `Примечания: ${sanitizedMessage}` : ""}`;

    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);
    
    if (whatsappUrl) {
      safeOpenUrl(whatsappUrl, ['https://wa.me/']);
    }
  };
  return <section className="min-h-screen flex items-center justify-center py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-lg w-full">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-8 sm:mb-10">
          <motion.h1 initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-luxury mb-3">
            {t('booking.title')}

          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="font-body text-muted-foreground text-xs sm:text-sm">
            {t('booking.subtitle')}
          </motion.p>
        </motion.div>

        <motion.form initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8">
          <div className="space-y-4 sm:space-y-5">
            {/* Name */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.3
          }} className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} required className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base" placeholder={t('contact.namePlaceholder')} />
            </motion.div>

            {/* Phone */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.4
          }} className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" value={formData.phone} onChange={e => setFormData({
              ...formData,
              phone: e.target.value
            })} required className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 text-sm sm:text-base" placeholder={t('contact.phonePlaceholder')} />
            </motion.div>

            {/* Car */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.5
          }} className="relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select value={formData.car} onChange={e => setFormData({
              ...formData,
              car: e.target.value
            })} required className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base">
                <option value="">{t('contact.carPlaceholder')}</option>
                <option value="Mercedes-Benz G63 AMG">Mercedes-Benz G63 AMG</option>
                <option value="Mercedes-Maybach GLS 600">Mercedes-Maybach GLS 600</option>
                <option value="Mercedes-Benz S-Class">Mercedes-Benz S-Class</option>
                <option value="Mercedes-AMG GT">Mercedes-AMG GT</option>
                <option value={t('common.other')}>{t('common.other')}</option>
              </select>
            </motion.div>

            {/* Service */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.6
          }} className="relative">
              <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select value={formData.service} onChange={e => setFormData({
              ...formData,
              service: e.target.value
            })} required className="w-full bg-input border border-border pl-12 pr-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base">
                <option value="">{t('contact.servicePlaceholder')}</option>
                <option value="exterior">{t('contact.exteriorPackage')}</option>
                <option value="interior">{t('contact.interiorPackage')}</option>
                <option value="performance">{t('contact.performancePackage')}</option>
                <option value="full">{t('contact.fullTransformation')}</option>
              </select>
            </motion.div>

            {/* Message */}
            <motion.textarea initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.7
          }} value={formData.message} onChange={e => setFormData({
            ...formData,
            message: e.target.value
          })} rows={3} className="w-full bg-input border border-border px-4 py-3 font-body text-foreground focus:border-foreground focus:outline-none transition-all duration-300 resize-none text-sm sm:text-base" placeholder={t('contact.messagePlaceholder')} />
          </div>

          <motion.button initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.4,
          delay: 0.8
        }} type="submit" disabled={!formData.name || !formData.phone || !formData.car || !formData.service} className="w-full mt-6 flex items-center justify-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
            <MessageCircle className="w-4 h-4" />
            {t('booking.submit')}
          </motion.button>
        </motion.form>
      </div>
    </section>;
};
export default BookingForm;