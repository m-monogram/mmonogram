import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Search } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { representatives } from "@/data/representatives";

// Public-domain simplified world topology
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const RepresentativesPage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return representatives;
    return representatives.filter(
      (r) =>
        r.city.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-premium-black text-foreground">
      <SEOHead
        title="Official Representatives — M-Monogram Worldwide"
        description="Locate the nearest M-Monogram representative for your convenience. Our global network of authorized partners across the Middle East, Europe, Asia and the Americas."
        path="/representatives"
      />
      <Header />

      <main className="pt-28 sm:pt-32 pb-20">
        {/* Hero */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-eyebrow text-foreground/60">
              Global Network
            </span>
            <h1 className="h-display-2 mt-3 sm:mt-4 uppercase">
              Official Representatives
            </h1>
            <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-base text-foreground/60 leading-relaxed">
              Locate the nearest M-Monogram representative for your convenience.
              Our authorized partners deliver the same atelier-grade experience
              worldwide.
            </p>
          </motion.div>
        </section>

        {/* Map */}
        <section className="px-2 sm:px-6 md:px-12 max-w-7xl mx-auto mt-10 sm:mt-14">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative bg-slate-900/30 backdrop-blur-xl border border-white/10 overflow-hidden"
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
                        {/* Pulse ring */}
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

            {/* Map footer hint */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] sm:text-xs text-foreground/40 uppercase tracking-widest pointer-events-none">
              <span>Scroll to zoom · Drag to pan</span>
              <span>{representatives.length} Locations</span>
            </div>
          </motion.div>
        </section>

        {/* Search + List */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto mt-14 sm:mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <span className="text-eyebrow text-foreground/60">Directory</span>
              <h2 className="h-display-3 mt-2 uppercase">All Locations</h2>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, country..."
                className="w-full bg-slate-900/30 backdrop-blur-xl border border-white/10 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((rep, i) => (
              <motion.button
                key={rep.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                onClick={() => navigate(`/representatives/${rep.id}`)}
                onMouseEnter={() => setHovered(rep.id)}
                onMouseLeave={() => setHovered(null)}
                className="group relative text-left bg-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-white/30 p-5 sm:p-6 transition-all duration-300"
                style={{
                  boxShadow: "inset 0 0 30px rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-foreground/40 mb-2">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-[10px] tracking-widest uppercase">
                        {rep.region}
                      </span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl uppercase tracking-wide text-foreground truncate">
                      {rep.city}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/50 mt-1">
                      {rep.country}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-5 h-5 text-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.06)]" />
              </motion.button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-foreground/40 text-sm">
              No representatives match your search.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RepresentativesPage;
