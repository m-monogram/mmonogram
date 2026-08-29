import { useState, useEffect, forwardRef, memo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Instagram, Send, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "@/hooks/useNavigation";

import { safeCall } from "@/lib/validation";
import contactBuildingImage from "@/assets/menu/menu-contact-new.jpg.webp";
import MediaEdgeFade, { mediaFadeMask } from "@/components/MediaEdgeFade";
import { useContent } from "@/hooks/useContent";
import { submitLead } from "@/lib/leads";
import { useLeadGuard } from "@/components/LeadGuard";
import { defaultContent } from "@/lib/defaultContent";

interface ContactBookingSectionProps {
  setCurrentView?: (view: string) => void;
  prefilledModel?: string;
}

// Fixed: Use forwardRef for SVG icons to prevent ref warnings
const TikTokIcon = forwardRef<SVGSVGElement, { className?: string; strokeWidth?: number }>(({ className }, ref) => (
  <svg ref={ref} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
));
TikTokIcon.displayName = "TikTokIcon";

const SnapchatIcon = forwardRef<SVGSVGElement, { className?: string; strokeWidth?: number }>(({ className }, ref) => (
  <svg ref={ref} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.603.603 0 0 1 .274-.067c.12 0 .24.03.345.09.195.09.345.24.45.42.045.135.06.27.045.42-.03.12-.09.255-.18.375a1.2 1.2 0 0 1-.645.375c-.135.03-.27.06-.42.09-.24.045-.465.09-.69.12-.09.015-.15.075-.18.18-.015.03-.015.06-.015.09.015.09.03.18.045.27.135.54.345 1.08.645 1.575.465.75 1.155 1.365 2.01 1.8.285.135.555.21.75.255a.427.427 0 0 1 .12.015c.255.075.435.24.525.45.045.12.06.24.06.375 0 .195-.06.405-.195.585-.27.39-.795.66-1.53.84-.165.045-.345.075-.465.105-.135.03-.24.06-.285.075-.09.03-.165.06-.255.105-.12.06-.24.12-.345.195-.165.12-.315.27-.45.45-.225.285-.465.51-.72.66-.375.21-.78.315-1.155.315-.225 0-.435-.03-.63-.09a1.68 1.68 0 0 1-.165-.045c-.225-.075-.45-.135-.72-.195-.21-.045-.435-.09-.69-.09-.3 0-.585.045-.885.135-.27.075-.525.15-.765.225a4.416 4.416 0 0 1-.93.195c-.285.015-.57-.045-.84-.165-.285-.12-.54-.285-.765-.495a2.94 2.94 0 0 1-.465-.585 1.34 1.34 0 0 0-.255-.27c-.075-.045-.165-.09-.27-.12a4.3 4.3 0 0 0-.315-.075c-.12-.03-.285-.06-.45-.105-.735-.18-1.26-.45-1.53-.84a1.2 1.2 0 0 1-.195-.585c0-.135.015-.255.06-.375.09-.21.27-.375.525-.45a.427.427 0 0 1 .12-.015c.195-.045.465-.12.75-.255.855-.435 1.545-1.05 2.01-1.8.3-.495.51-1.035.645-1.575.015-.09.03-.18.045-.27 0-.03 0-.06-.015-.09-.03-.105-.09-.165-.18-.18-.225-.03-.45-.075-.69-.12-.15-.03-.285-.06-.42-.09a1.2 1.2 0 0 1-.645-.375 1.016 1.016 0 0 1-.18-.375c-.015-.15 0-.285.045-.42.105-.18.255-.33.45-.42a.69.69 0 0 1 .345-.09c.09 0 .18.015.274.067.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z" />
  </svg>
));
SnapchatIcon.displayName = "SnapchatIcon";

const ContactBookingSection = memo(({ setCurrentView, prefilledModel }: ContactBookingSectionProps) => {
  const navigate = useNavigate();
  const { navigateToView } = useNavigation({ setCurrentView });
  const { content: contactCms } = useContent("contact");
  const cmsDefaults = defaultContent.contact;
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { trap, trapValue, isAutomated } = useLeadGuard();
  const [imagePosition, setImagePosition] = useState("center center");
  const [isMobile, setIsMobile] = useState(false);

  // Set image position and mobile state based on screen size - centered
  useEffect(() => {
    const updatePosition = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      // Centered for all screen sizes
      setImagePosition("center center");
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);
  useEffect(() => {
    if (prefilledModel) {
      setFormData((prev) => ({
        ...prev,
        message: `Interested in: ${prefilledModel}`,
      }));
    }
  }, [prefilledModel]);
  const contactInfo = {
    address: String(contactCms?.address || cmsDefaults.address || "Meta Garage St 9A, Al Quoz Industrial Area 1, Dubai"),
    hours: String(contactCms?.workHours || cmsDefaults.workHours || "Daily 9AM – 8PM (Sunday closed)"),
    phones: [
      {
        label: "AR/EN",
        number: String(contactCms?.phone || cmsDefaults.phone || "+971 54 507 7707"),
      },
      {
        label: "RU",
        number: "+971 52 665 7985",
      },
      {
        label: "Office",
        number: String(contactCms?.landline || cmsDefaults.landline || "(04) 228 4177"),
      },
    ],
    socials: [
      {
        label: "M-Monogram",
        url: "https://www.instagram.com/metagarage_m_monogram",
        icon: Instagram,
        full: true,
      },
      {
        label: "MetaGarage",
        url: "https://www.instagram.com/1metagarage",
        icon: Instagram,
        full: true,
      },
      {
        label: "TikTok",
        url: "https://www.tiktok.com/@metagarage",
        icon: TikTokIcon,
        full: false,
      },
      {
        label: "Snapchat",
        url: "https://www.snapchat.com/add/metagarage",
        icon: SnapchatIcon,
        full: false,
      },
    ],
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    /* Боту показываем ровно то же, что человеку, но заявку не отправляем. */
    if (isAutomated()) {
      setIsSubmitted(true);
      return;
    }
    setIsSubmitting(true);

    const result = await submitLead({
      companyWebsite: trapValue,
      name: formData.name,
      phone: formData.phone,
      email: formData.email.trim() || null,
      message: formData.message.trim() || null,
      source: "contact",
      page: "/contact",
    });

    setIsSubmitting(false);

    if (!result.ok) {
      if (result.error === "phone") setSubmitError("Please enter a valid phone number");
      else if (result.error === "name") setSubmitError("Please enter your name");
      else if (result.error === "email") setSubmitError("Please enter a valid email");
      else if (result.error === "throttled") setSubmitError("Your request has already been sent. Please wait a couple of minutes.");
      else setSubmitError("Could not send. Please try again.");
      return;
    }

    setFormData({ name: "", phone: "", email: "", message: "" });
    setIsSubmitted(true);
  };
  const handleCall = (phone: string) => {
    safeCall(phone);
  };
  return (
    <div className="min-h-screen relative luxury-bg overflow-hidden">
      {/* Hero Image Section */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={contactBuildingImage}
            alt="M-Monogram Commission Exterior"
            loading="eager"
            fetchpriority="high"
            decoding="sync"
            className="w-full h-full object-cover brightness-110 contrast-110"
            style={{ objectPosition: imagePosition, ...mediaFadeMask }}
          />

          {/* Fade photo into the black page */}
          <MediaEdgeFade edges="both" />

        {/* Decorative Lines */}
        <div className="absolute inset-y-0 left-8 sm:left-16 w-px bg-white/10">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "10rem" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-20 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent"
          />
        </div>
        <div className="absolute inset-y-0 right-8 sm:right-16 w-px bg-white/10">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "10rem" }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute top-20 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent"
          />
        </div>

        {/* Back Button - positioned below logo */}
        <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigateToView("home");
              }
            }}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50 backdrop-blur-md rounded-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Hero Content - no text, just background image */}
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-16 pb-20 sm:pb-24 md:pb-32 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Left: Form */}
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
            >
              <div className="p-6 sm:p-8 md:p-10 rounded-none border border-white/10 bg-[hsl(0_0%_6%)] shadow-lg">
                {!isSubmitted ? (
                  <>
                    <div className="mb-6">
                      {/* Единственный заголовок страницы контактов — h1 */}
                      <h1 className="font-display text-xl tracking-widest text-white mb-2 sm:text-base">
                        Fill form below to send us a message
                      </h1>
                      <p className="font-body text-xs text-white/40">Request a consultation</p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative space-y-4">
                      {trap}
                      <div>
                        <label className="font-body text-[10px] text-white/50 block mb-1.5 uppercase tracking-widest">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-none bg-[hsl(0_0%_10%)] border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all font-body text-sm sm:text-base"
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-body text-[10px] text-white/50 block mb-1.5 uppercase tracking-widest">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-none bg-[hsl(0_0%_10%)] border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all font-body text-sm sm:text-base"
                          placeholder="+971..."
                          required
                        />
                      </div>

                      <div>
                        <label className="font-body text-[10px] text-white/50 block mb-1.5 uppercase tracking-widest">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-none bg-[hsl(0_0%_10%)] border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all font-body text-sm sm:text-base"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="font-body text-[10px] text-white/50 block mb-1.5 uppercase tracking-widest">
                          Message
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-none bg-[hsl(0_0%_10%)] border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all resize-none font-body text-sm sm:text-base"
                          placeholder="Tell us about your project..."
                        />
                      </div>

                      {submitError && (
                        <p className="text-red-400 text-xs font-body">{submitError}</p>
                      )}

                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={isSubmitting || !formData.name.trim() || !formData.phone.trim()}
                          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                          className="w-full group flex items-center justify-center gap-3 bg-white text-black py-3.5 sm:py-4 rounded-none font-body text-sm sm:text-base uppercase tracking-widest disabled:opacity-50 cursor-pointer transition-all hover:bg-white/90 shadow-lg hover:shadow-xl"
                        >
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          {isSubmitting ? "Sending..." : "Submit"}
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      </div>
                    </form>
                  </>
                ) : (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-none border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10">
                      <Send className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-display text-xl tracking-widest text-white mb-3">Sent!</h3>
                    <p className="font-body text-white/50 text-sm mb-8">We'll reply within 24 hours</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setSubmitError("");
                        setFormData({
                          name: "",
                          phone: "",
                          email: "",
                          message: "",
                        });
                      }}
                      className="font-body text-xs text-white/50 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Send Another
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right: Contact Info */}
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.4,
              }}
              className="space-y-4"
            >
              {/* Visit Us */}
              <div className="p-6 sm:p-8 md:p-10 rounded-none border border-white/10 bg-[hsl(0_0%_6%)] shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-none border border-white/20 flex items-center justify-center flex-shrink-0 bg-white/5">
                    <MapPin className="w-5 h-5 text-white/70" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm tracking-widest text-white mb-2 uppercase">Visit Us</h3>
                    <p className="font-body text-white/60 text-sm leading-relaxed mb-1">{contactInfo.address}</p>
                    <p className="font-body text-white/40 text-xs">{contactInfo.hours}</p>
                  </div>
                </div>
              </div>

              {/* Call Us */}
              <div className="p-6 sm:p-8 md:p-10 rounded-none border border-white/10 bg-[hsl(0_0%_6%)] shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-none border border-white/20 flex items-center justify-center flex-shrink-0 bg-white/5">
                    <Phone className="w-5 h-5 text-white/70" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-sm tracking-widest text-white mb-3 uppercase">Call Us</h3>
                    <div className="space-y-2">
                      {contactInfo.phones.map((phone) => (
                        <motion.button
                          key={phone.number}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCall(phone.number)}
                          className="tap-target flex w-full items-center gap-2 text-left group cursor-pointer"
                        >
                          <span className="font-body text-[10px] text-white/40 uppercase tracking-wider w-10">
                            {phone.label}
                          </span>
                          <span className="font-body text-white/80 group-hover:text-white transition-colors text-sm">
                            {phone.number}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Us */}
              <div className="pt-2">
                <h3 className="font-display text-[10px] tracking-widest text-white/40 mb-3 uppercase">Follow Us</h3>
                <div className="space-y-2">
                  {contactInfo.socials
                    .filter((s) => s.full)
                    .map((social) => (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-none bg-[hsl(0_0%_6%)] border border-white/10 hover:border-white/20 hover:bg-[hsl(0_0%_8%)] transition-all group"
                      >
                        <social.icon
                          className="w-4 h-4 text-white/50 group-hover:text-white transition-colors"
                          strokeWidth={1.5}
                        />
                        <span className="font-body text-xs text-white/60 group-hover:text-white transition-colors">
                          {social.label}
                        </span>
                      </a>
                    ))}
                  <div className="grid grid-cols-2 gap-2">
                    {contactInfo.socials
                      .filter((s) => !s.full)
                      .map((social) => (
                        <a
                          key={social.label}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-none bg-[hsl(0_0%_6%)] border border-white/10 hover:border-white/20 hover:bg-[hsl(0_0%_8%)] transition-all group"
                        >
                          <social.icon className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                          <span className="font-body text-xs text-white/60 group-hover:text-white transition-colors">
                            {social.label}
                          </span>
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Call Button */}
      <motion.button
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
          delay: 0.8,
        }}
        onClick={() => handleCall(contactInfo.phones[0].number)}
        className="fixed bottom-5 right-5 w-12 h-12 rounded-none bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-50"
      >
        <Phone className="w-5 h-5" />
      </motion.button>
    </div>
  );
});

ContactBookingSection.displayName = "ContactBookingSection";

export default ContactBookingSection;
