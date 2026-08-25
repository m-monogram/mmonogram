import { useState } from "react";
import { Menu, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logoWhite from "@/assets/logo-white.webp";
import logoBlack from "@/assets/logo-black.webp";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { AuroraBackground } from "@/components/ui/aurora-background";

// Menu images - themed for each section
import menuHome from "@/assets/menu/menu-home.webp";
import menuBrand from "@/assets/menu/menu-brand.webp";
import menuProjects from "@/assets/g63-quarter-new.webp";
import menuModifications from "@/assets/commission-hero-final.webp";
import menuVerify from "@/assets/menu/menu-verify.webp";
import menuContact from "@/assets/menu/menu-contact-new.jpg.webp";
import menuNews from "@/assets/hero-main-new.webp";
interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
  /* "light" — для страниц со светлым фоном: тёмный логотип и тёмные контролы */
  variant?: "dark" | "light";
}
interface MenuCardProps {
  item: {
    labelKey: string;
    view: string;
    image: string;
    descKey: string;
    video?: string;
    isWide?: boolean;
  };
  index: number;
  currentView: string;
  onNavigate: () => void;
  t: (key: string) => string;
}
const MenuCard = ({
  item,
  index,
  currentView,
  onNavigate,
  t
}: MenuCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return <motion.button type="button" initial={{
    opacity: 0,
    scale: 0.7,
    y: 60,
    rotateX: 20,
    filter: "blur(15px)"
  }} animate={{
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)"
  }} exit={{
    opacity: 0,
    scale: 0.85,
    y: -30,
    filter: "blur(10px)"
  }} transition={{
    delay: index * 0.07 + 0.15,
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
  }} onClick={onNavigate} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={`group relative overflow-hidden cursor-pointer touch-target ${item.isWide ? "col-span-2 aspect-video" : "aspect-square md:aspect-[1.5/1] min-h-[40vw] sm:min-h-0"}`}>
    {/* Enhanced hover background effect */}
    <AnimatePresence>
      {isHovered && <motion.span className="absolute inset-0 h-full w-full bg-neutral-200/10 dark:bg-slate-800/30 backdrop-blur-sm block rounded-none z-10" layoutId="menuHoverBackground" initial={{
        opacity: 0
      }} animate={{
        opacity: 1,
        transition: {
          duration: 0.15
        }
      }} exit={{
        opacity: 0,
        transition: {
          duration: 0.15,
          delay: 0.2
        }
      }} />}
    </AnimatePresence>

    {/* Glassmorphism card frame */}
    <div className={`absolute inset-0 transition-all duration-500 z-20 ${currentView === item.view ? "ring-1 ring-foreground/60 bg-foreground/5" : "ring-1 ring-foreground/10 group-hover:ring-foreground/40"}`} />

    {/* Background - Video or Image */}
    <div className="absolute inset-0 overflow-hidden z-0">
      {item.video ? <video src={item.video} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover transition-all duration-700 will-change-transform group-hover:scale-105" /> : <img src={item.image} alt={t(item.labelKey)} loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 will-change-transform group-hover:scale-110 group-hover:brightness-110 ${item.view === "brand" ? "object-[50%_70%]" : item.view === "contact" ? "object-[50%_52%] sm:object-[50%_60%]" : item.view === "verify" ? "object-[50%_65%]" : item.view === "home" ? "object-[50%_55%]" : "object-center"}`} />}

      {/* Light gradient overlay - minimal to show car */}
      <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-500 ${item.video ? "from-black/50 via-black/15 to-transparent group-hover:from-black/40" : "from-black/50 via-black/20 to-transparent group-hover:from-black/40 group-hover:via-black/15"}`} />
    </div>

    {/* Minimal text - only section name */}
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pb-4 pt-8 px-3 z-30">
      <div className="text-center">
        <motion.span className="font-display text-xs sm:text-sm tracking-widest text-white uppercase" animate={{
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -2 : 0
        }} transition={{
          duration: 0.2
        }}>
          {t(item.labelKey)}
        </motion.span>
      </div>
    </div>

    {/* Corner accents with smooth animations */}
    <motion.div className="absolute top-3 left-3 border-l border-t border-foreground/30" animate={{
      opacity: isHovered ? 1 : 0,
      width: isHovered ? 16 : 12,
      height: isHovered ? 16 : 12
    }} transition={{
      duration: 0.3
    }} />
    <motion.div className="absolute top-3 right-3 border-r border-t border-foreground/30" animate={{
      opacity: isHovered ? 1 : 0,
      width: isHovered ? 16 : 12,
      height: isHovered ? 16 : 12
    }} transition={{
      duration: 0.3
    }} />
    <motion.div className="absolute bottom-3 left-3 border-l border-b border-foreground/30" animate={{
      opacity: isHovered ? 1 : 0,
      width: isHovered ? 16 : 12,
      height: isHovered ? 16 : 12
    }} transition={{
      duration: 0.3
    }} />
    <motion.div className="absolute bottom-3 right-3 border-r border-b border-foreground/30" animate={{
      opacity: isHovered ? 1 : 0,
      width: isHovered ? 16 : 12,
      height: isHovered ? 16 : 12
    }} transition={{
      duration: 0.3
    }} />

    {/* Active indicator with smooth layout transition */}
    {currentView === item.view && <>
      <motion.div layoutId="activeMenuIndicator" className="absolute inset-0 border-2 border-foreground/80 z-40" transition={{
        duration: 0.4,
        ease: "easeOut"
      }} />
      <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.15)] z-40" />
    </>}

    {/* Subtle glow on hover */}
    {isHovered && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="absolute inset-0 shadow-[0_0_40px_rgba(255,255,255,0.1)] z-20 pointer-events-none" />}
  </motion.button>;
};
const Header = ({
  currentView: propCurrentView,
  setCurrentView: propSetCurrentView,
  variant = "dark"
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const {
    t
  } = useLanguage();

  // Centralized menu handlers to prevent icon overlap during exit animation
  const openMenu = () => {
    setMenuClosing(false);
    setMenuOpen(true);
  };
  const closeMenu = () => {
    setMenuClosing(true);
    setMenuOpen(false);
  };
  const navItems = [{
    labelKey: 'nav.brand',
    view: 'brand',
    image: menuBrand,
    descKey: 'nav.brandDesc'
  }, {
    labelKey: 'nav.modifications',
    view: 'modifications',
    image: menuModifications,
    descKey: 'nav.modificationsDesc'
  }, {
    labelKey: 'nav.verify',
    view: 'verify',
    image: menuVerify,
    descKey: 'nav.verifyDesc'
  }, {
    labelKey: 'nav.contact',
    view: 'contact',
    image: menuContact,
    descKey: 'nav.contactDesc'
  }, {
    labelKey: 'nav.press',
    view: 'press',
    image: menuNews,
    descKey: 'nav.pressDesc',
    isWide: true
  }];
  const viewToPath: Record<string, string> = {
    "home": "/",
    "brand": "/brand",
    "projects": "/projects",
    "modifications": "/commission",
    "configurator": "/configurator",
    "verify": "/verify",
    "contact": "/contact",
    "booking": "/booking",
    "press": "/press"
  };
  const getViewFromPath = (path: string): string => {
    if (path === "/") return "home";
    if (path === "/brand") return "brand";
    if (path === "/projects") return "projects";
    if (path === "/commission") return "modifications";
    if (path === "/configurator") return "configurator";
    if (path === "/verify") return "verify";
    if (path === "/contact") return "contact";
    if (path === "/booking") return "booking";
    if (path.startsWith("/press") || path.startsWith("/news")) return "press";
    return "home";
  };
  const currentView = propCurrentView || getViewFromPath(location.pathname);
  const isModifications = currentView === 'modifications';
  const handleSetCurrentView = (view: string) => {
    if (propSetCurrentView) {
      propSetCurrentView(view);
    } else {
      const path = viewToPath[view] || "/brand";
      navigate(path);
    }
  };
  const handleNavClick = (view: string) => {
    handleSetCurrentView(view);
    closeMenu();
  };
  const handleBookProject = () => {
    handleSetCurrentView("contact");
    closeMenu();
  };
  return <>
    {/* Static logo - left position - HIDDEN when menu is open OR closing */}
    {!(menuOpen || menuClosing) && <div className="absolute left-4 sm:left-6 md:left-12 z-[90]" style={{
      top: `calc(env(safe-area-inset-top, 0px) + 1rem)`
    }}>
      <button onClick={() => {
        navigate("/");
        window.scrollTo({
          top: 0,
          behavior: "instant"
        });
      }} className="cursor-pointer touch-target flex items-center justify-center" type="button">
        <img src={variant === "light" ? logoBlack : logoWhite} alt="M-Monogram" width={479} height={113} fetchpriority="high" decoding="sync" className="h-10 sm:h-12 md:h-14 w-auto max-w-[11rem] sm:max-w-[13rem] object-contain object-left" />
      </button>
    </div>}

    {/* Fixed menu controls - HIDDEN when menu is open OR closing */}
    {!(menuOpen || menuClosing) && <header className="fixed top-0 right-0 z-[100] px-4 py-4 sm:px-6 sm:py-5 md:px-12 md:py-6 pointer-events-none" style={{
      paddingTop: `calc(env(safe-area-inset-top, 0px) + 1rem)`
    }}>
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* Book a Project Button - Primary CTA */}


        <LanguageSwitcher variant={variant} />

        <button onClick={openMenu} className={`relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-300 cursor-pointer touch-target border border-transparent ${variant === "light" ? "hover:border-black/30 hover:bg-black/5" : "hover:border-foreground/30 hover:bg-foreground/5"}`} aria-label="Open menu" type="button">
          <Menu className={`w-7 h-7 sm:w-8 sm:h-8 ${variant === "light" ? "text-black" : "text-foreground"}`} strokeWidth={1.5} />
        </button>
      </div>
    </header>}

    <AnimatePresence mode="wait" onExitComplete={() => setMenuClosing(false)}>
      {menuOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.4,
        ease: "easeOut"
      }} className="fixed inset-0 z-[200] overflow-y-auto">
        {/* Premium Aurora Background */}
        <AuroraBackground className="absolute inset-0" intensity="subtle" showRadialGradient={true}>
          {/* Children required by AuroraBackground */}
          <div className="absolute inset-0 bg-premium-black/50" />
        </AuroraBackground>

        {/* Menu Header with Logo, Language, and Close */}
        <div className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6" style={{
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 1rem)`
        }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.button type="button" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.1,
              duration: 0.4
            }} onClick={() => {
              navigate("/");
              closeMenu();
            }} className="cursor-pointer touch-target">
              <img src={logoWhite} alt="M-Monogram" width={479} height={113} className="h-10 sm:h-12 md:h-14 w-auto max-w-[11rem] sm:max-w-[13rem] object-contain object-left" />
            </motion.button>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.15,
                duration: 0.4
              }}>
                <LanguageSwitcher />
              </motion.div>

              <motion.button type="button" initial={{
                opacity: 0,
                scale: 0.8
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                delay: 0.2,
                duration: 0.3
              }} onClick={closeMenu} className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 cursor-pointer touch-target" aria-label="Close menu">
                <X className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>

          {/* Divider line */}
          <motion.div initial={{
            scaleX: 0
          }} animate={{
            scaleX: 1
          }} transition={{
            delay: 0.25,
            duration: 0.6
          }} className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Decorative diagonal lines - bottom left corner like Mansory */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0.08" />
                <stop offset="50%" stopColor="white" stopOpacity="0.04" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Multiple diagonal lines from bottom-left going up */}
            {[...Array(12)].map((_, i) => <motion.line key={i} x1={-100 + i * 60} y1={1100} x2={400 + i * 60} y2={600} stroke="url(#lineGradient)" strokeWidth="0.5" initial={{
              pathLength: 0,
              opacity: 0
            }} animate={{
              pathLength: 1,
              opacity: 1
            }} transition={{
              delay: 0.3 + i * 0.05,
              duration: 0.8,
              ease: "easeOut"
            }} />)}
          </svg>
        </div>

        <div className="relative min-h-full flex flex-col px-4 sm:px-6 py-12 sm:py-16 z-20">
          {/* Decorative corner elements */}
          <motion.div initial={{
            opacity: 0,
            scale: 0.5
          }} animate={{
            opacity: 0.3,
            scale: 1
          }} transition={{
            delay: 0.4,
            duration: 0.5
          }} className="absolute top-20 left-4 w-12 h-12 border-l border-t border-foreground/30" />
          <motion.div initial={{
            opacity: 0,
            scale: 0.5
          }} animate={{
            opacity: 0.3,
            scale: 1
          }} transition={{
            delay: 0.45,
            duration: 0.5
          }} className="absolute top-20 right-4 w-12 h-12 border-r border-t border-foreground/30" />
          <motion.div initial={{
            opacity: 0,
            scale: 0.5
          }} animate={{
            opacity: 0.3,
            scale: 1
          }} transition={{
            delay: 0.5,
            duration: 0.5
          }} className="absolute bottom-20 left-4 w-12 h-12 border-l border-b border-foreground/30" />
          <motion.div initial={{
            opacity: 0,
            scale: 0.5
          }} animate={{
            opacity: 0.3,
            scale: 1
          }} transition={{
            delay: 0.55,
            duration: 0.5
          }} className="absolute bottom-12 right-4 w-12 h-12 border-r border-b border-foreground/30" />

          {/* Main content - Cards Grid */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-6">
            <nav className="w-full max-w-[95vw] sm:max-w-3xl lg:max-w-4xl">
              {/* Cards Grid - 2x2 layout */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {navItems.map((item, index) => <MenuCard key={item.view} item={item} index={index} currentView={currentView} onNavigate={() => handleNavClick(item.view)} t={t} />)}
              </div>
            </nav>
          </div>

          {/* Tagline at bottom with enhanced styling */}
          <motion.div initial={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} transition={{
            delay: 0.7,
            duration: 0.5,
            ease: "easeOut"
          }} className="text-center py-6 sm:py-8">
            <div className="relative inline-block">
              {/* Decorative lines */}
              <motion.div initial={{
                scaleX: 0
              }} animate={{
                scaleX: 1
              }} transition={{
                delay: 0.9,
                duration: 0.6
              }} className="absolute left-1/2 -translate-x-1/2 -top-3 w-16 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />

              <span className="font-display text-[10px] sm:text-xs tracking-widest text-foreground/40 uppercase">
                {t("brand.tagline")}
              </span>

              <motion.div initial={{
                scaleX: 0
              }} animate={{
                scaleX: 1
              }} transition={{
                delay: 0.95,
                duration: 0.6
              }} className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-16 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </motion.div>}
    </AnimatePresence>
  </>;
};
export default Header;