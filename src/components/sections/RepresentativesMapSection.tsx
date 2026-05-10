import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <section
      id="representatives"
      className="relative py-24 md:py-32 px-4 sm:px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <span className="text-eyebrow text-foreground/60">
            Global Network
          </span>
          <h2 className="h-display-2 mt-3 sm:mt-4 uppercase">
            Official Representatives
          </h2>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-base text-foreground/60 leading-relaxed">
            Locate the nearest M-Monogram representative.
          </p>
        </div>

        <div
          className="relative mt-10 sm:mt-14 bg-slate-900/30 backdrop-blur-xl border border-white/10 overflow-hidden"
          style={{
            boxShadow:
              "inset 0 0 60px rgba(255,255,255,0.03), 0 30px 80px -40px rgba(0,0,0,0.8)",
          }}
        >
          <div className="aspect-[16/9] w-full">
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{ scale: 165 }}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup minZoom={1} maxZoom={5} center={[20, 15]}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: "hsl(0 0% 8%)",
                            stroke: "hsl(0 0% 18%)",
                            strokeWidth: 0.4,
                            outline: "none",
                          },
                          hover: {
                            fill: "hsl(0 0% 11%)",
                            stroke: "hsl(0 0% 25%)",
                            strokeWidth: 0.4,
                            outline: "none",
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
                      onClick={() => navigate(`/representatives/${rep.id}`)}
                      style={{
                        default: { cursor: "pointer", outline: "none" },
                        hover: { cursor: "pointer", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    >
                      <circle
                        r={isActive ? 10 : 7}
                        fill="hsl(0 0% 100%)"
                        opacity={0.12}
                        style={{ transition: "all 0.3s ease" }}
                      />
                      <circle
                        r={isActive ? 5 : 3.5}
                        fill="hsl(0 0% 100%)"
                        stroke="hsl(0 0% 0%)"
                        strokeWidth={1}
                        style={{ transition: "all 0.3s ease" }}
                      />
                      {isActive && (
                        <g transform="translate(8, -4)">
                          <rect
                            x={0}
                            y={-9}
                            width={Math.max(rep.city.length * 5.5 + 10, 50)}
                            height={16}
                            fill="hsl(0 0% 0% / 0.85)"
                            stroke="hsl(0 0% 100% / 0.2)"
                            strokeWidth={0.4}
                          />
                          <text
                            x={5}
                            y={2}
                            fill="hsl(0 0% 100%)"
                            fontSize={9}
                            fontFamily="var(--font-family-primary), sans-serif"
                            style={{ letterSpacing: "0.05em" }}
                          >
                            {rep.city.toUpperCase()}
                          </text>
                        </g>
                      )}
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] sm:text-xs text-foreground/40 uppercase tracking-widest pointer-events-none">
            <span>Scroll to zoom · Drag to pan</span>
            <span>{representatives.length} Locations</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RepresentativesMapSection;
