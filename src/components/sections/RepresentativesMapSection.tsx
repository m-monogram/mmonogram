import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { representatives } from "@/data/representatives";
import { useLanguage } from "@/contexts/LanguageContext";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const RepresentativesMapSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hovered, setHovered] = useState<string | null>(null);

  const openRep = (id: string) => navigate(`/representatives/${id}`);

  return (
    <section
      id="representatives"
      className="relative py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-premium-black"
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.5) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-foreground/30" />
            <span className="text-eyebrow text-foreground/50">
              {t("representatives.eyebrow")}
            </span>
            <span className="h-px w-8 bg-foreground/30" />
          </div>
          <h2 className="h-display-2 uppercase">
            {t("representatives.title")}
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-foreground/55 leading-relaxed">
            {t("representatives.subtitle")}
          </p>
        </motion.div>

        {/* Map + Location list */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-gradient-to-br from-slate-900/40 via-slate-950/50 to-black/60 backdrop-blur-xl border border-white/10 overflow-hidden rounded-sm"
            style={{
              boxShadow:
                "inset 0 0 80px rgba(255,255,255,0.04), 0 30px 80px -40px rgba(0,0,0,0.9)",
            }}
          >
            {/* Grid overlay for premium feel */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />

            <div className="aspect-[16/10] sm:aspect-[16/9] w-full">
              <ComposableMap
                projection="geoEqualEarth"
                width={800}
                height={450}
                projectionConfig={{ scale: 720, center: [8, 47] }}
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <defs>
                  <radialGradient id="marker-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.55" />
                    <stop offset="60%" stopColor="hsl(0 0% 100%)" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ZoomableGroup
                  minZoom={1}
                  maxZoom={5}
                  center={[8, 47]}
                  translateExtent={[[0, 0], [800, 450]]}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: "hsl(0 0% 12%)",
                              stroke: "hsl(0 0% 26%)",
                              strokeWidth: 0.45,
                              outline: "none",
                            },
                            hover: {
                              fill: "hsl(0 0% 16%)",
                              stroke: "hsl(0 0% 38%)",
                              strokeWidth: 0.5,
                              outline: "none",
                              cursor: "default",
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {representatives.map((rep) => {
                    const isActive = hovered === rep.id;
                    return (
                      <Marker
                        key={rep.id}
                        coordinates={rep.coordinates}
                        onMouseEnter={() => setHovered(rep.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => openRep(rep.id)}
                        style={{
                          default: { cursor: "pointer", outline: "none" },
                          hover: { cursor: "pointer", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      >
                        {/* Outer glow */}
                        <circle
                          r={isActive ? 22 : 16}
                          fill="url(#marker-glow)"
                          style={{ transition: "all 0.4s ease" }}
                        />
                        {/* Pulse ring */}
                        <circle
                          r={9}
                          fill="none"
                          stroke="hsl(0 0% 100%)"
                          strokeWidth={0.6}
                          opacity={0.35}
                        >
                          <animate
                            attributeName="r"
                            values="6;14;6"
                            dur="2.4s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.5;0;0.5"
                            dur="2.4s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Core dot */}
                        <circle
                          r={isActive ? 4.5 : 3.5}
                          fill="hsl(0 0% 100%)"
                          stroke="hsl(0 0% 0%)"
                          strokeWidth={1}
                          style={{ transition: "all 0.3s ease" }}
                        />
                        {/* Always-visible label */}
                        <g transform="translate(7, -6)">
                          <text
                            x={0}
                            y={0}
                            fill="hsl(0 0% 100%)"
                            fillOpacity={isActive ? 1 : 0.75}
                            fontSize={7.5}
                            fontFamily="var(--font-family-primary), sans-serif"
                            style={{
                              letterSpacing: "0.14em",
                              transition: "all 0.3s ease",
                              paintOrder: "stroke",
                              stroke: "hsl(0 0% 0%)",
                              strokeWidth: 2.2,
                              strokeLinejoin: "round",
                            }}
                          >
                            {rep.city.toUpperCase()}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {/* Bottom info bar */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] sm:text-[11px] text-foreground/40 uppercase tracking-[0.25em] pointer-events-none">
              <span>{t("representatives.mapHint")}</span>
              <span>
                {representatives.length} · {t("representatives.locations")}
              </span>
            </div>
          </motion.div>

          {/* Locations list */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 px-1">
              <span className="text-eyebrow text-foreground/40">
                {t("representatives.locations")}
              </span>
              <span className="h-px flex-1 bg-foreground/10" />
            </div>

            {representatives.map((rep, i) => {
              const isActive = hovered === rep.id;
              return (
                <button
                  key={rep.id}
                  onMouseEnter={() => setHovered(rep.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => openRep(rep.id)}
                  className={`group relative text-left p-4 sm:p-5 border transition-all duration-300 backdrop-blur-xl rounded-sm ${
                    isActive
                      ? "border-white/25 bg-white/[0.04]"
                      : "border-white/10 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Number */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-body text-[10px] tracking-[0.4em] text-foreground/40">
                      0{i + 1}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-foreground shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                          : "bg-foreground/30"
                      }`}
                    />
                  </div>

                  <div className="font-display text-lg sm:text-xl tracking-widest uppercase text-foreground font-bold leading-tight">
                    {rep.city}
                  </div>
                  <div className="mt-1 text-[11px] sm:text-xs text-foreground/50 tracking-wide">
                    {rep.region}
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-foreground/40 group-hover:text-foreground/70 transition-colors">
                    <span>{t("representatives.atelier")}</span>
                    <span className="flex-1 h-px bg-foreground/10 group-hover:bg-foreground/30 transition-colors" />
                    <span className="translate-x-0 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.aside>
        </div>
      </div>
    </section>
  );
};

export default RepresentativesMapSection;
