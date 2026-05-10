import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { getRepresentativeById, representatives } from "@/data/representatives";

const RepresentativeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rep = id ? getRepresentativeById(id) : undefined;

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
            onClick={() => navigate("/representatives")}
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

  // Static map preview via OpenStreetMap embed
  const [lng, lat] = rep.coordinates;
  const bbox = `${lng - 0.1},${lat - 0.05},${lng + 0.1},${lat + 0.05}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

  return (
    <div className="min-h-screen bg-premium-black text-foreground">
      <SEOHead
        title={`${rep.name} — ${rep.city}, ${rep.country}`}
        description={`Visit M-Monogram official representative in ${rep.city}, ${rep.country}. ${rep.description ?? "Authorized partner of the M-Monogram global network."}`}
        path={`/representatives/${rep.id}`}
      />
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto">
        <Link
          to="/representatives"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-foreground/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Representatives
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 sm:mt-8"
        >
          <span className="text-eyebrow text-foreground/60">{rep.region}</span>
          <h1 className="h-display-2 mt-3 uppercase">{rep.city}</h1>
          <p className="mt-2 text-base sm:text-lg text-foreground/60">
            {rep.country}
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-3 bg-slate-900/30 backdrop-blur-xl border border-white/10 overflow-hidden"
          >
            <div className="aspect-[4/3] w-full bg-black">
              <iframe
                title={`Map of ${rep.city}`}
                src={osmEmbed}
                className="w-full h-full border-0 grayscale contrast-110"
                loading="lazy"
              />
            </div>
            <a
              href={osmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-[10px] sm:text-xs tracking-widest uppercase text-foreground/50 hover:text-foreground border-t border-white/10 transition-colors"
            >
              Open larger map →
            </a>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-2 bg-slate-900/30 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6"
          >
            <div>
              <span className="text-eyebrow text-foreground/50">Atelier</span>
              <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wide mt-2">
                {rep.name}
              </h2>
              {rep.description && (
                <p className="mt-3 text-sm text-foreground/60 leading-relaxed">
                  {rep.description}
                </p>
              )}
            </div>

            <div className="h-px bg-white/10" />

            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-foreground/50 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-foreground/40 text-[10px] tracking-widest uppercase mb-0.5">
                    Address
                  </div>
                  <div className="text-foreground/80">
                    {rep.address ?? "Address coming soon"}
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-foreground/50 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-foreground/40 text-[10px] tracking-widest uppercase mb-0.5">
                    Phone
                  </div>
                  <div className="text-foreground/80">
                    {rep.phone ?? "Available on request"}
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-foreground/50 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-foreground/40 text-[10px] tracking-widest uppercase mb-0.5">
                    Email
                  </div>
                  <div className="text-foreground/80">
                    {rep.email ?? "info@mmonogram.com"}
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-foreground/50 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-foreground/40 text-[10px] tracking-widest uppercase mb-0.5">
                    Hours
                  </div>
                  <div className="text-foreground/80">
                    {rep.hours ?? "By appointment"}
                  </div>
                </div>
              </li>
            </ul>

            <button
              onClick={() => navigate("/contact")}
              className="w-full inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/60 hover:bg-white/5 px-6 py-3 text-xs tracking-widest uppercase transition-all"
            >
              Request Appointment <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Other in region */}
        {others.length > 0 && (
          <section className="mt-20">
            <span className="text-eyebrow text-foreground/60">
              Also in {rep.region}
            </span>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => navigate(`/representatives/${o.id}`)}
                  className="group text-left bg-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-white/30 p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base uppercase tracking-wide">
                        {o.city}
                      </h3>
                      <p className="text-xs text-foreground/50 mt-1">
                        {o.country}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
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
