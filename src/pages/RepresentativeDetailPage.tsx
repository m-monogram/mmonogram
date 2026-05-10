import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ArrowRight, Compass, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { getRepresentativeById, representatives } from "@/data/representatives";
import { useLanguage } from "@/contexts/LanguageContext";

const formatCoord = (value: number, posLabel: string, negLabel: string) => {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const sec = (((abs - deg) * 60 - min) * 60).toFixed(1);
  return `${deg}° ${min}' ${sec}" ${value >= 0 ? posLabel : negLabel}`;
};

const RepresentativeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rep = id ? getRepresentativeById(id) : undefined;

  const goBackToMap = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("representatives")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  if (!rep) {
    return (
      <div className="min-h-screen bg-premium-black text-foreground">
        <Header />
        <main className="pt-32 px-6 max-w-3xl mx-auto text-center">
          <h1 className="h-display-3 uppercase mb-4">Representative Not Found</h1>
          <p className="text-foreground/60 mb-8">
            This location does not exist or is no longer active.
          </p>
          <button
            onClick={goBackToMap}
            className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 px-6 py-3 text-sm tracking-widest uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Map
          </button>
        </main>
      </div>
    );
  }

  const others = representatives
    .filter((r) => r.id !== rep.id && r.region === rep.region)
    .slice(0, 3);

  const [lng, lat] = rep.coordinates;
  const bbox = `${lng - 0.08},${lat - 0.04},${lng + 0.08},${lat + 0.04}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
  const gMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const latStr = formatCoord(lat, "N", "S");
  const lngStr = formatCoord(lng, "E", "W");

  return (
    <div className="min-h-screen bg-premium-black text-foreground relative overflow-hidden">
      <SEOHead
        title={`${rep.name} — ${rep.city}, ${rep.country}`}
        description={`Visit M-Monogram official representative in ${rep.city}, ${rep.country}. ${rep.description ?? "Authorized partner of the M-Monogram global network."}`}
        path={`/representatives/${rep.id}`}
      />
      <Header />

      {/* Ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, hsl(0 0% 8%) 0%, transparent 60%), radial-gradient(50% 40% at 90% 80%, hsl(0 0% 6%) 0%, transparent 60%)",
        }}
      />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        {/* Back link */}
        <button
          type="button"
          onClick={goBackToMap}
          className="group inline-flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Global Network
        </button>

        {/* Hero */}
        <section className="mt-10 sm:mt-14 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 text-foreground/40">
                <span className="h-px w-8 bg-foreground/30" />
                <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase">
                  {rep.region}
                </span>
              </div>
              <h1 className="h-display-1 mt-4 uppercase leading-[0.9]">
                {rep.city}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-foreground/55 tracking-wide">
                {rep.country}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-foreground/40 font-mono">
              <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{latStr}</span>
              <span className="opacity-30">·</span>
              <span>{lngStr}</span>
            </div>
          </div>

          <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </section>

        {/* Main grid */}
        <section className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Map */}
          <div
            className="lg:col-span-7 relative bg-slate-900/30 backdrop-blur-xl border border-white/10 overflow-hidden animate-fade-in"
            style={{
              boxShadow:
                "inset 0 0 60px rgba(255,255,255,0.03), 0 30px 80px -40px rgba(0,0,0,0.8)",
            }}
          >
            <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-black relative">
              <iframe
                title={`Map of ${rep.city}`}
                src={osmEmbed}
                className="w-full h-full border-0 grayscale contrast-125 brightness-75"
                loading="lazy"
              />
              {/* edge vignette */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.7)" }}
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/10">
              <a
                href={gMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 sm:px-5 py-3.5 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                Open in Google Maps
              </a>
              <a
                href={osmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-3.5 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/40 hover:text-foreground border-l border-white/10 transition-colors"
              >
                OSM
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 animate-fade-in">
            <div
              className="bg-slate-900/30 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-7"
              style={{ boxShadow: "inset 0 0 40px rgba(255,255,255,0.03)" }}
            >
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/40">
                  Atelier
                </span>
                <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wide mt-2 leading-tight">
                  {rep.name}
                </h2>
                {rep.description && (
                  <p className="mt-3 text-sm text-foreground/60 leading-relaxed">
                    {rep.description}
                  </p>
                )}
              </div>

              <div className="h-px bg-white/10" />

              <ul className="space-y-5 text-sm">
                {[
                  { Icon: MapPin, label: "Address", value: rep.address ?? "Address coming soon", href: undefined },
                  { Icon: Phone, label: "Phone", value: rep.phone ?? "Available on request", href: rep.phone ? `tel:${rep.phone.replace(/\s/g, "")}` : undefined },
                  { Icon: Mail, label: "Email", value: rep.email ?? "info@mmonogram.com", href: `mailto:${rep.email ?? "info@mmonogram.com"}` },
                  { Icon: Clock, label: "Hours", value: rep.hours ?? "By appointment", href: undefined },
                ].map(({ Icon, label, value, href }) => {
                  const content = (
                    <>
                      <Icon className="w-4 h-4 mt-0.5 text-foreground/40 flex-shrink-0 group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                      <div className="min-w-0">
                        <div className="text-foreground/40 text-[10px] tracking-[0.25em] uppercase mb-1">
                          {label}
                        </div>
                        <div className="text-foreground/85 break-words">
                          {value}
                        </div>
                      </div>
                    </>
                  );
                  return (
                    <li key={label}>
                      {href ? (
                        <a href={href} className="group flex gap-3 hover:bg-white/5 -mx-2 px-2 py-1.5 transition-colors">
                          {content}
                        </a>
                      ) : (
                        <div className="flex gap-3 px-2 py-1.5">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={() => navigate("/contact")}
                className="group relative w-full inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/60 hover:bg-white/5 px-6 py-4 text-[11px] tracking-[0.3em] uppercase transition-all overflow-hidden"
              >
                <span className="relative z-10">Request Appointment</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700" />
              </button>
            </div>
          </div>
        </section>

        {/* Other in region */}
        {others.length > 0 && (
          <section className="mt-24 sm:mt-32">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/40">
                  Continue exploring
                </span>
                <h3 className="h-display-3 mt-2 uppercase">
                  Also in {rep.region}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {others.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    navigate(`/representatives/${o.id}`);
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                  className="group relative text-left bg-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-white/30 p-5 sm:p-6 transition-all duration-300"
                  style={{ boxShadow: "inset 0 0 30px rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-foreground/40 mb-2">
                        <MapPin className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-[9px] tracking-[0.25em] uppercase">
                          {o.region}
                        </span>
                      </div>
                      <h4 className="font-display text-lg uppercase tracking-wide truncate">
                        {o.city}
                      </h4>
                      <p className="text-xs text-foreground/50 mt-1 truncate">
                        {o.country}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.06)]" />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default RepresentativeDetailPage;
