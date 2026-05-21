import { motion } from "framer-motion";
import { Instagram, Phone, Mail, MapPin, ArrowRight, Youtube } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoMmonogram from "@/assets/logo-mmonogram.webp";
import ScrollReveal from "./ScrollReveal";

import { useLanguage } from "@/contexts/LanguageContext";

interface FooterProps {
  setCurrentView?: (view: string) => void;
}

const Footer = ({ setCurrentView: propSetCurrentView }: FooterProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/metagarage_m_monogram/?igsh=MTBtejVmOGdzYW5jMQ%3D%3D", label: "M-Monogram" },
    { icon: Instagram, href: "https://www.instagram.com/1metagarage/?igsh=Zmt3b3Z0Zzl6cWNi", label: "MetaGarage" },
    { icon: Youtube, href: "https://www.youtube.com/@alex_meta?si=ukxmVuHe3xM9EMgD", label: "YouTube" },
  ];

  const quickLinks = [
    { labelKey: "nav.projects", view: "projects" },
    { labelKey: "nav.modifications", view: "modifications" },
    { labelKey: "nav.brand", view: "brand" },
    { labelKey: "nav.press", view: "press" },
    { labelKey: "nav.contact", view: "contact" },
  ];

  const handleNavClick = (view: string) => {
    if (view === "representatives") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("representatives")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }
    if (propSetCurrentView) {
      propSetCurrentView(view);
    } else {
      const viewToPath: Record<string, string> = {
        "home": "/",
        "brand": "/brand",
        "projects": "/projects",
        "modifications": "/commission",
        "verify": "/verify",
        "contact": "/contact",
        "booking": "/booking",
        "press": "/press",
        "news": "/press",
      };
      const path = viewToPath[view] || "/";
      navigate(path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-premium-black relative overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent relative z-10" />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Top: Logo + CTA */}
          <ScrollReveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={logoMmonogram} alt="M-Monogram" className="h-9 w-auto" loading="lazy" decoding="async" />
              <div>
                <p className="text-white font-display text-subtitle tracking-widest">M-MONOGRAM</p>
              </div>
            </div>
            <motion.button
              onClick={() => handleNavClick("contact")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-white text-black font-body text-sm sm:text-base uppercase tracking-widest hover:bg-white/90 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("hero.bookProject")}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </ScrollReveal>

          {/* Links Grid */}
          <ScrollReveal delay={0.05} className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-display text-caption uppercase tracking-widest mb-3 text-white/50">{t("nav.home")}</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavClick(link.view)}
                      className="text-white/60 hover:text-white transition-colors font-body text-caption cursor-pointer"
                    >
                      {t(link.labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-caption uppercase tracking-widest mb-3 text-white/50">{t("nav.contact")}</h4>
              <div className="space-y-2">
                <a
                  href="tel:+971545077707"
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-body text-caption"
                >
                  <Phone className="w-3 h-3" />
                  +971 54 507 7707
                </a>
                <a
                  href="mailto:m_monogram@mail.ru"
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-body text-caption"
                >
                  <Mail className="w-3 h-3" />
                  m_monogram@mail.ru
                </a>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="font-display text-caption uppercase tracking-widest mb-3 text-white/50">{t("contact.location")}</h4>
              <a
                href="https://www.google.com/maps/place/Meta+Garage/@25.1495063,55.226896,17z/data=!3m1!4b1!4m6!3m5!1s0xa27338e445343799:0x4ea888fff25cf0ce!8m2!3d25.1495063!4d55.226896!16s%2Fg%2F11kj97dmh_?hl=en-RU&coh=164777&entry=tt&shorturl=1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-white/60 hover:text-white transition-colors font-body text-caption mb-1"
              >
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>
                  Meta Garage St 9A
                  <br />
                  Al Quoz, Dubai
                </span>
              </a>
              <p className="text-white/40 font-body text-caption pl-5">{t("footer.hours")}</p>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-display text-caption uppercase tracking-widest mb-3 text-white/50">{t("footer.follow")}</h4>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all"
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
                <a
                  href="https://www.tiktok.com/@1metagarage?_r=1&_t=ZS-92Scri5I2Ec"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </a>
                <a
                  href="https://www.snapchat.com/@metagarage_auto?share_id=2W1uVf0sqsQ&locale=en-US"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snapchat"
                  className="w-8 h-8 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
                  </svg>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom Bar */}
        <div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-white/30 font-body text-caption">
              <p>© {new Date().getFullYear()} M-Monogram. {t("footer.rights")}.</p>
              <div className="flex gap-4">
                <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">
                  {t("footer.privacy")}
                </Link>
                <Link to="/offer-agreement" className="hover:text-white/60 transition-colors">
                  {t("footer.terms")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
