import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { representatives } from "@/data/representatives";
import { useLanguage } from "@/contexts/LanguageContext";
import MediaEdgeFade from "@/components/MediaEdgeFade";

const GEO_URL = "/maps/countries-110m.json";

const LABEL_OFFSET: Record<string, string> = {
  "switzerland-hungary": "translate(-10, -6)",
  germany: "translate(8, -6)",
  "france-monaco": "translate(8, 14)",
};

const GEO_STYLE = {
  default: {
    fill: "hsl(0 0% 12%)",
    stroke: "hsl(0 0% 26%)",
    strokeWidth: 0.45,
    outline: "none" as const,
    pointerEvents: "none" as const,
  },
  hover: {
    fill: "hsl(0 0% 12%)",
    stroke: "hsl(0 0% 26%)",
    strokeWidth: 0.45,
    outline: "none" as const,
    pointerEvents: "none" as const,
  },
  pressed: {
    outline: "none" as const,
    pointerEvents: "none" as const,
  },
};

const WorldGeographies = memo(function WorldGeographies() {
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography key={geo.rsmKey} geography={geo} style={GEO_STYLE} />
        ))
      }
    </Geographies>
  );
});

const MapMarkers = memo(function MapMarkers({
  hovered,
  onHover,
  onOpen,
}: {
  hovered: string | null;
  onHover: (id: string | null) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <>
      {representatives.map((rep) => {
        const isActive = hovered === rep.id;
        return (
          <Marker key={rep.id} coordinates={rep.coordinates}>
            <g
              role="button"
              tabIndex={0}
              aria-label={rep.city}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => onHover(rep.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onOpen(rep.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(rep.id);
                }
              }}
            >
              <circle r={42} fill="transparent" />
              <circle
                r={isActive ? 22 : 16}
                fill="url(#marker-glow)"
                style={{ pointerEvents: "none" }}
              />
              <circle
                r={isActive ? 5 : 3.75}
                fill="hsl(0 0% 100%)"
                stroke="hsl(0 0% 0%)"
                strokeWidth={1.1}
                style={{ pointerEvents: "none" }}
              />
              <g transform={LABEL_OFFSET[rep.id] ?? "translate(8, -5)"}>
                <text
                  x={0}
                  y={0}
                  textAnchor={rep.id === "switzerland-hungary" ? "end" : "start"}
                  fill="hsl(0 0% 100%)"
                  fillOpacity={isActive ? 1 : 0.8}
                  fontSize={7.5}
                  fontFamily="var(--font-family-primary), sans-serif"
                  style={{
                    letterSpacing: "0.14em",
                    paintOrder: "stroke",
                    stroke: "hsl(0 0% 0%)",
                    strokeWidth: 2.2,
                    strokeLinejoin: "round",
                    pointerEvents: "none",
                  }}
                >
                  {rep.city.toUpperCase()}
                </text>
              </g>
            </g>
          </Marker>
        );
      })}
    </>
  );
});

const RepresentativesMapSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hovered, setHovered] = useState<string | null>(null);

  const openRep = useCallback(
    (id: string) => navigate(`/representatives/${id}`),
    [navigate]
  );

  return (
    <section className="relative bg-black text-white">
      <div className="w-full px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold uppercase tracking-[0.14em] text-[22px] sm:text-3xl md:text-[34px] text-white"
        >
          {t("representatives.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-3 sm:mt-4 max-w-3xl font-body uppercase tracking-[0.22em] text-[9px] sm:text-[11px] text-white/55 leading-relaxed"
        >
          {t("representatives.subtitle")}
        </motion.p>
      </div>

      <div className="px-5 sm:px-8 lg:px-12 pb-16 sm:pb-20 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden bg-neutral-950"
        >
          <div
            className="aspect-[16/10] sm:aspect-[21/9] w-full overscroll-contain"
            style={{ touchAction: "pan-y" }}
          >
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
              <WorldGeographies />
              <MapMarkers hovered={hovered} onHover={setHovered} onOpen={openRep} />
            </ComposableMap>
          </div>
          <MediaEdgeFade edges="bottom" />
        </motion.div>

        <div className="mt-2 sm:mt-[10px] grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-[10px]">
          {representatives.map((rep, i) => {
            const isActive = hovered === rep.id;
            return (
              <button
                key={rep.id}
                type="button"
                onMouseEnter={() => setHovered(rep.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(rep.id)}
                onBlur={() => setHovered(null)}
                onClick={() => openRep(rep.id)}
                className={`group text-left px-5 py-7 sm:px-6 sm:py-9 transition-colors duration-300 ${
                  isActive ? "bg-neutral-100" : "bg-white hover:bg-neutral-100"
                }`}
              >
                <div className="font-body text-[10px] tracking-[0.4em] text-black/40 mb-4">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display text-lg sm:text-xl md:text-2xl tracking-[0.14em] uppercase text-black font-bold leading-tight">
                  {rep.city}
                </div>
                <div className="mt-2 text-[11px] sm:text-xs text-black/50 tracking-[0.08em] uppercase">
                  {rep.region}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RepresentativesMapSection;
