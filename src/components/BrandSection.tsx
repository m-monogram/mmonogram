import { memo, forwardRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import g900WhiteFront from "@/assets/g900-white-front.jpg";
import brand1 from "@/assets/brand/brand-1-optimized.jpg";
import brand2 from "@/assets/brand/brand-2-optimized.jpg";
import brand3 from "@/assets/brand/brand-3-optimized.jpg";
import commissionHeroFinal from "@/assets/commission-hero-final.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigation } from "@/hooks/useNavigation";
import { useNavigate } from "react-router-dom";
import { PillarsCarousel } from "@/components/PillarsCarousel";
// Lazy load ProjectModal for better initial performance
const ProjectModal = lazy(() => import("@/components/ProjectModal"));
import NextSectionCTA from "@/components/NextSectionCTA";
import LatestAdditionsCarousel from "@/components/sections/latest-additions-carousel";
import { useProjects, DBProject } from "@/hooks/useProjects";

// Hero video configuration
const BRAND_HERO_VIDEO = "/videos/brand-hero-video.mp4";
interface BrandSectionProps {
  setCurrentView?: (view: string) => void;
}
const BrandSection = memo(forwardRef<HTMLDivElement, BrandSectionProps>(({
  setCurrentView
}, ref) => {
  const {
    navigateToView
  } = useNavigation({
    setCurrentView
  });
  const {
    t
  } = useLanguage();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<DBProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);

  // Map pillars to actual projects for modal display
  const pillarProjectMapping = useMemo(() => [projects[0], projects[1], projects[2]], [projects]);
  const handlePillarClick = useCallback((index: number) => {
    const project = pillarProjectMapping[index];
    if (project) {
      setSelectedProject(project);
      setIsModalOpen(true);
    }
  }, [pillarProjectMapping]);
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing project for exit animation
    setTimeout(() => setSelectedProject(null), 300);
  }, []);
  const handleViewProjects = useCallback(() => {
    setIsModalOpen(false);
    // Projects are now part of Brand, so scroll to projects section
    const projectsSection = document.getElementById("projects-section");
    if (projectsSection) {
      projectsSection.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, []);
  const handleCommission = useCallback(() => {
    setIsModalOpen(false);
    navigateToView("contact");
  }, [navigateToView]);
  const navigate = useNavigate();
  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);
  const pillars = [{
    title: t('brand.exclusive'),
    description: t('brand.exclusiveDesc'),
    image: brand1
  }, {
    title: t('brand.premium'),
    description: t('brand.premiumDesc'),
    image: brand2
  }, {
    title: t('brand.global'),
    description: t('brand.globalDesc'),
    image: brand3
  }];
  return <div ref={ref} className="min-h-screen relative z-10 luxury-bg">

    {/* Hero Section with Video - Compact Letterbox */}
    <section className="w-full bg-premium-black pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
      {/* Video Container - Wider Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-[21/9] lg:aspect-[21/9] overflow-hidden">
        <video src={BRAND_HERO_VIDEO} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{
          objectPosition: "center center"
        }} onError={e => {
          // Fallback: if video fails to load, show image
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const img = document.createElement('img');
            img.src = g900WhiteFront;
            img.alt = "M-Monogram G900 White";
            img.className = "w-full h-full object-cover";
            parent.appendChild(img);
          }
        }} />
      </div>
    </section>

    {/* Brand Statement Section — Premium Redesign */}
    <section className="relative bg-premium-black overflow-hidden">

      {/* ── ORIGIN BLOCK ── Two-column grid: text left / stamp right */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative max-w-7xl mx-auto px-6 sm:px-10 md:px-16 pt-20 sm:pt-24 md:pt-32 pb-0"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-start">
          {/* Left: label + description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <p className="font-body text-[9px] sm:text-[10px] tracking-widest text-white/25 uppercase mb-6 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-white/20" />
              Est. 2018 — Dubai
            </p>
            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/65 leading-[1.8] font-light max-w-xl">
              {t('brand.transformDescription').split('\n\n')[0]}
            </p>
          </motion.div>

          {/* Right: large decorative year stamp */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 0.06, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="hidden md:block select-none"
            aria-hidden
          >
            <span
              className="font-display text-[9rem] lg:text-[11rem] font-extralight text-white leading-none tracking-tighter"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}
            >
              2018
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── FULL-WIDTH DIVIDER ── */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent origin-left mt-16 sm:mt-20"
      />

      {/* ── CINEMATIC MISSION ── Giant centered headline */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 md:px-16 py-20 sm:py-24 md:py-32">
        {/* Background ghost text */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="font-display text-[5rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] font-extralight leading-none tracking-tight uppercase whitespace-nowrap"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.03)', color: 'transparent' }}
          >
            ATELIER
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="relative z-10 text-center"
        >
          {/* Decorative thin line above */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="w-24 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            <h2 
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-[0.3em] font-extralight leading-[1.2]"
              style={{ textShadow: '0 0 60px rgba(255,255,255,0.08)' }}
            >
              Mastering the Art
              <br />
              <span className="text-white/40 tracking-[0.15em] text-xl sm:text-2xl md:text-3xl mt-4 block">
                of Singular Automotive Creation
              </span>
            </h2>

            <div className="w-12 h-px bg-white/20 mx-auto" />

            <p className="font-body text-sm sm:text-base md:text-lg text-white/50 tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed font-light">
              Crafted for presidents,
              <br />
              industry magnates & celebrities.
            </p>
          </div>

          {/* Decorative thin line below */}
          <div className="flex items-center justify-center gap-6 mt-16">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="w-24 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* ── FULL-WIDTH DIVIDER ── */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent origin-right"
      />

      {/* ── SIGNATURE STATEMENT ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 py-16 sm:py-20 md:py-24 text-center"
      >
        <p className="font-display text-base sm:text-lg md:text-xl lg:text-2xl tracking-widest uppercase text-white/50 font-light">
          {t('brand.transformDescription').split('\n\n')[2]}
        </p>
      </motion.div>

      {/* ── VALUES BAR ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="border-t border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
            {[
              { label: t('brand.exclusivity'), num: '01' },
              { label: t('brand.precision'), num: '02' },
              { label: t('brand.innovationValue'), num: '03' },
            ].map(({ label, num }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                className="py-8 sm:py-10 flex flex-col items-center gap-2 group"
              >
                <span className="font-body text-[8px] tracking-widest text-white/15 uppercase">{num}</span>
                <span className="font-body text-[9px] sm:text-[10px] md:text-xs tracking-widest uppercase text-white/40 group-hover:text-white/60 transition-colors duration-500">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>


    {/* Pillars - Compact */}
    <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-16 bg-premium-black">
      <div className="max-w-7xl mx-auto">
        <PillarsCarousel items={pillars} className="gap-6" />
      </div>
    </section>

    {/* Latest Additions - Projects Section with Emphasis */}
    <section id="projects-section" className="py-12 sm:py-16 bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Section Header with emphasis */}
        <div className="mb-4 sm:mb-6">

        </div>
      </div>

      <LatestAdditionsCarousel variant="dark" skipAurora onProjectClick={handleProjectClick} className="pt-0 pb-0" />
    </section>

    {/* Next Section CTA: Modifications (Commission) */}
    <NextSectionCTA label={t('common.next')} nextLabel={t('brand.commission')} onClick={() => navigateToView("modifications")} />

    {/* Project Modal */}
    {isModalOpen && selectedProject && <Suspense fallback={null}>
      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={handleCloseModal} onViewProjects={handleViewProjects} onCommission={handleCommission} />
    </Suspense>}

    {/* Hero Video Modal */}
    <AnimatePresence>
      {isVideoModalOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.5
      }} className="fixed inset-0 z-[100] bg-premium-black flex items-center justify-center">
        {/* Close Button */}
        <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-2 text-white/50 hover:text-white transition-colors cursor-pointer">
          <X className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1} />
        </button>

        <div className="w-full h-full p-0 sm:p-4 md:p-8 flex items-center justify-center">
          <video src={BRAND_HERO_VIDEO} controls autoPlay className="max-w-full max-h-full w-full h-full object-contain" controlsList="nodownload" />
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}));
BrandSection.displayName = "BrandSection";
export default BrandSection;