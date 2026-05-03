import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Palette, Gauge, Shield, Volume2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getCategories = (t: (key: string) => string) => [
  {
    id: 1,
    icon: Palette,
    title: t("catalog.exterior"),
    description: t("catalog.exteriorDesc"),
    items: [
      t("catalog.exteriorItem1"),
      t("catalog.exteriorItem2"),
      t("catalog.exteriorItem3"),
      t("catalog.exteriorItem4"),
    ],
  },
  {
    id: 2,
    icon: Sparkles,
    title: t("catalog.interior"),
    description: t("catalog.interiorDesc"),
    items: [
      t("catalog.interiorItem1"),
      t("catalog.interiorItem2"),
      t("catalog.interiorItem3"),
      t("catalog.interiorItem4"),
    ],
  },
  {
    id: 3,
    icon: Wrench,
    title: t("catalog.wheels"),
    description: t("catalog.wheelsDesc"),
    items: [
      t("catalog.wheelsItem1"),
      t("catalog.wheelsItem2"),
      t("catalog.wheelsItem3"),
      t("catalog.wheelsItem4"),
    ],
  },
  {
    id: 4,
    icon: Gauge,
    title: t("catalog.performance"),
    description: t("catalog.performanceDesc"),
    items: [
      t("catalog.performanceItem1"),
      t("catalog.performanceItem2"),
      t("catalog.performanceItem3"),
      t("catalog.performanceItem4"),
    ],
  },
  {
    id: 5,
    icon: Volume2,
    title: t("catalog.exhaust"),
    description: t("catalog.exhaustDesc"),
    items: [
      t("catalog.exhaustItem1"),
      t("catalog.exhaustItem2"),
      t("catalog.exhaustItem3"),
      t("catalog.exhaustItem4"),
    ],
  },
  {
    id: 6,
    icon: Shield,
    title: t("catalog.protection"),
    description: t("catalog.protectionDesc"),
    items: [
      t("catalog.protectionItem1"),
      t("catalog.protectionItem2"),
      t("catalog.protectionItem3"),
      t("catalog.protectionItem4"),
    ],
  },
];

const Catalog = () => {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <section className="min-h-screen py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-2xl sm:text-3xl md:text-5xl uppercase tracking-luxury mb-3 sm:mb-4"
          >
{t('catalog.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-muted-foreground max-w-2xl mx-auto text-body"
          >
{t('catalog.subtitle')}
          </motion.p>
        </motion.div>

        {/* Categories Grid with Hover Effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {getCategories(t).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group bg-card border border-border p-6 sm:p-8 hover:border-accent-blue/50 transition-all duration-300"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Enhanced Hover Background Effect */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    className="absolute inset-0 h-full w-full bg-neutral-200/10 dark:bg-slate-800/30 block rounded-none -m-2 p-2"
                    layoutId="catalogHoverBackground"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.15 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15, delay: 0.2 },
                    }}
                  />
                )}
              </AnimatePresence>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-none bg-accent-blue/10 flex items-center justify-center group-hover:bg-accent-blue/20 transition-colors">
                  <category.icon className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl uppercase tracking-wide mb-1">
                    {category.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-subtitle">
                    {category.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="font-body text-subtitle text-foreground/80 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-none bg-accent-blue/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="font-body text-muted-foreground mb-4 text-body">
            {t('catalog.cta')}
          </p>
          <a
            href="#contact"
            className="inline-block btn-primary px-8 py-3 text-body"
          >
            {t('catalog.contactUs')}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Catalog;
