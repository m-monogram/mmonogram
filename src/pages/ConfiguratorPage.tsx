import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Armchair,
  Camera,
  Car,
  Check,
  ClipboardList,
  DollarSign,
  DoorOpen,
  Disc3,
  Gem,
  Lightbulb,
  Maximize2,
  Package,
  Palette,
  RotateCcw,
  Save,
  Share2,
  Sparkles,
  SunMoon,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BuildConfig,
  CALIPER_FINISHES,
  DEFAULT_CONFIG,
  GRILLE_FINISHES,
  INTERIOR_FINISHES,
  KIT_PACKAGES,
  PAINTS,
  RIM_DESIGNS,
  RIM_FINISHES,
  decodeConfig,
  encodeConfig,
  getBuildPrice,
  type CameraFocus,
} from "@/components/configurator/config";
import SceneErrorBoundary from "@/components/configurator/SceneErrorBoundary";
import { CAR_IDS, CARS } from "@/components/configurator/models";
import type { InteriorView } from "@/components/configurator/ConfigPanel";

const ConfiguratorScene = lazy(() => import("@/components/configurator/Scene"));

const PAINT_PREVIEWS = Object.values(
  import.meta.glob("@/assets/previews/paint-*.jpg", { eager: true, import: "default" })
) as string[];
const RIM_PREVIEWS = Object.values(
  import.meta.glob("@/assets/previews/rim-*.jpg", { eager: true, import: "default" })
) as string[];
const FINISH_PREVIEWS = Object.values(
  import.meta.glob("@/assets/previews/finish-*.jpg", { eager: true, import: "default" })
) as string[];

type StudioSection =
  | "model"
  | "exterior"
  | "wheels"
  | "calipers"
  | "kit"
  | "carbon"
  | "openings"
  | "lights"
  | "env"
  | "interior"
  | "overview";

const SECTION_FOCUS: Partial<Record<StudioSection, CameraFocus>> = {
  exterior: "exterior",
  wheels: "wheels",
  calipers: "wheels",
  kit: "kit",
  carbon: "carbon",
  openings: "kit",
  lights: "lights",
  env: "env",
};

function Swatch({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      className={`block h-10 w-10 shrink-0 rounded-full ring-1 ring-white/20 ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  preview,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  preview: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-[116px] min-w-[168px] max-w-[184px] flex-col justify-between overflow-hidden rounded-md border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-white/70 bg-white/[0.12] shadow-[0_12px_34px_rgba(255,255,255,0.08)]"
          : "border-white/12 bg-black/35 hover:border-white/35 hover:bg-white/[0.07]"
      }`}
    >
      <span className="flex min-h-10 items-center gap-3 text-white/75">{preview}</span>
      <span className="min-w-0">
        <span className="block truncate font-body text-[13px] text-white">{title}</span>
        {subtitle && (
          <span className="mt-1 block truncate font-body text-[10px] uppercase tracking-[0.14em] text-white/38">
            {subtitle}
          </span>
        )}
      </span>
      {selected && (
        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
          <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
      )}
    </button>
  );
}

function PreviewImage({ src, alt, fallback }: { src?: string; alt: string; fallback: string }) {
  if (!src) return <Swatch color={fallback} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-12 w-[82px] shrink-0 rounded-md object-cover ring-1 ring-white/15"
    />
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-white/12 bg-black/55 text-white/80 shadow-[0_12px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-colors hover:border-white/36 hover:bg-white/12 hover:text-white"
    >
      {children}
    </button>
  );
}

const ConfiguratorPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<BuildConfig>(() => decodeConfig(searchParams.get("c")));
  const [activeSection, setActiveSection] = useState<StudioSection>("exterior");
  const [copied, setCopied] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [focus, setFocus] = useState<CameraFocus>(() => {
    const v = searchParams.get("v");
    const allowed: CameraFocus[] = [
      "default", "exterior", "wheels", "kit", "carbon", "lights", "env",
      "interiorFront", "interiorDriver", "interiorRear",
    ];
    return v && (allowed as string[]).includes(v) ? (v as CameraFocus) : "default";
  });

  const handleChange = useCallback(
    (next: BuildConfig) => {
      setConfig(next);
      setSearchParams({ c: encodeConfig(next) }, { replace: true });
    },
    [setSearchParams]
  );

  const set = useCallback((patch: Partial<BuildConfig>) => handleChange({ ...config, ...patch }), [config, handleChange]);

  const chooseSection = useCallback((section: StudioSection) => {
    setActiveSection(section);
    setFocus(section === "interior" ? "interiorDriver" : SECTION_FOCUS[section] ?? "default");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${location.origin}/configurator?c=${encodeConfig(config)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* Clipboard can be unavailable in some embedded contexts. */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [config]);

  const price = getBuildPrice(config);
  const formattedPrice = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price),
    [price]
  );

  const handleSave = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("mmonogram-builds") ?? "[]") as Array<{ code: string; savedAt: string; price: number }>;
    const code = encodeConfig(config);
    const next = [{ code, savedAt: new Date().toISOString(), price }, ...saved.filter((item) => item.code !== code)].slice(0, 12);
    localStorage.setItem("mmonogram-builds", JSON.stringify(next));
    handleChange({ ...config, saved: true });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  }, [config, handleChange, price]);

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#configurator-canvas canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `m-monogram-build-${encodeConfig(config)}.png`;
    a.click();
  }, [config]);

  const handleReset = useCallback(() => {
    handleChange(DEFAULT_CONFIG);
    chooseSection("exterior");
  }, [chooseSection, handleChange]);

  const handleFullscreen = useCallback(() => {
    const root = document.documentElement;
    if (!document.fullscreenElement) root.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const sections = useMemo(
    () => [
      { id: "model" as const, label: t("config.model"), value: CARS[config.model].name, icon: Car },
      { id: "exterior" as const, label: t("config.exterior"), value: PAINTS[config.paint].name, icon: Palette },
      { id: "wheels" as const, label: t("config.rims"), value: RIM_DESIGNS[config.rim].name, icon: Disc3 },
      { id: "calipers" as const, label: "Calipers", value: CALIPER_FINISHES[config.caliper].name, icon: Disc3 },
      { id: "kit" as const, label: t("config.kit"), value: KIT_PACKAGES[config.kitPackage].name, icon: Package },
      { id: "carbon" as const, label: t("config.carbon"), value: config.carbon ? t("config.carbonOn") : t("config.carbonOff"), icon: Gem },
      { id: "openings" as const, label: "Openings", value: [config.doors && "Doors", config.hood && "Hood", config.trunk && "Trunk"].filter(Boolean).join(" · ") || "Closed", icon: DoorOpen },
      { id: "lights" as const, label: t("config.lights"), value: config.lights ? t("config.lightsOn") : t("config.lightsOff"), icon: Lightbulb },
      { id: "env" as const, label: t("config.environment"), value: config.night ? t("config.envNight") : t("config.envStudio"), icon: SunMoon },
      { id: "interior" as const, label: t("config.interior"), value: INTERIOR_FINISHES[config.interior].name, icon: Armchair },
      { id: "overview" as const, label: t("config.overview"), value: "", icon: ClipboardList },
    ],
    [config, t]
  );

  const overviewRows = [
    { label: t("config.model"), value: CARS[config.model].name },
    { label: t("config.exterior"), value: `${PAINTS[config.paint].name} · ${GRILLE_FINISHES[config.grille].name}` },
    { label: t("config.rims"), value: `${RIM_DESIGNS[config.rim].name} · ${RIM_FINISHES[config.rimFinish].name}` },
    { label: "Calipers", value: CALIPER_FINISHES[config.caliper].name },
    { label: t("config.kit"), value: KIT_PACKAGES[config.kitPackage].name },
    { label: t("config.carbon"), value: config.carbon ? t("config.carbonOn") : t("config.carbonOff") },
    { label: t("config.lights"), value: config.lights ? t("config.lightsOn") : t("config.lightsOff") },
    { label: t("config.environment"), value: config.night ? t("config.envNight") : t("config.envStudio") },
    { label: t("config.interior"), value: INTERIOR_FINISHES[config.interior].name },
    { label: "Openings", value: [config.doors && "4 doors", config.hood && "hood", config.trunk && "trunk"].filter(Boolean).join(" · ") || "closed" },
    { label: "Price", value: formattedPrice },
  ];

  const interiorViews: [InteriorView, string][] = [
    ["interiorFront", t("config.interiorFront")],
    ["interiorDriver", t("config.interiorDriver")],
    ["interiorRear", t("config.interiorRear")],
  ];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-premium-black">
      <SEOHead
        title="3D Studio - M-Monogram | Build Your G-Class"
        description="Configure your bespoke M-Monogram G-Class in real-time 3D: body colors, forged wheels, carbon packages and the M-Monogram body kit."
        path="/configurator"
      />
      <Header variant={config.night ? "dark" : "light"} />

      <div id="configurator-canvas" className="absolute inset-0">
        <SceneErrorBoundary>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-foreground/40 animate-pulse">
                  {t("hero.loading")}...
                </p>
              </div>
            }
          >
            <ConfiguratorScene config={config} focus={focus} />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[5.25rem] z-20 flex justify-center px-4 sm:top-[5.75rem]">
        <div className="pointer-events-auto flex items-center gap-2">
          <ToolbarButton label={copied ? t("config.shareCopied") : t("config.share")} onClick={handleShare}>
            {copied ? <Check className="h-[18px] w-[18px]" /> : <Share2 className="h-[18px] w-[18px]" />}
          </ToolbarButton>
          <ToolbarButton label={t("config.screenshot")} onClick={handleScreenshot}>
            <Camera className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton label={savedFlash || config.saved ? "Saved" : "Save car"} onClick={handleSave}>
            {savedFlash || config.saved ? <Check className="h-[18px] w-[18px]" /> : <Save className="h-[18px] w-[18px]" />}
          </ToolbarButton>
          <ToolbarButton label="Fullscreen" onClick={handleFullscreen}>
            <Maximize2 className="h-[18px] w-[18px]" />
          </ToolbarButton>
          <ToolbarButton label="Reset" onClick={handleReset}>
            <RotateCcw className="h-[18px] w-[18px]" />
          </ToolbarButton>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute bottom-[10.75rem] left-4 z-20 hidden md:block ${
          config.night ? "text-white/40" : "text-black/40"
        }`}
      >
        <p className="font-body text-[10px] uppercase tracking-[0.14em]">
          {t("config.demoNote")} · {CARS[config.model].name}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-[10.75rem] right-4 z-20 hidden md:flex items-center gap-2 rounded-md border border-white/10 bg-black/45 px-3 py-2 text-white/85 backdrop-blur-xl">
        <DollarSign className="h-4 w-4 text-white/48" />
        <span className="font-body text-[12px] uppercase tracking-[0.12em]">{formattedPrice}</span>
      </div>

      <motion.div
        initial={{ y: 38, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[rgba(8,8,9,0.88)] shadow-[0_-22px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        <div className="mx-auto w-full max-w-[1560px] px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {sections.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseSection(item.id)}
                  className={`flex h-[58px] min-w-[170px] items-center gap-2 rounded-md border px-3 text-left transition-all ${
                    active
                      ? "border-white/70 bg-white text-black"
                      : "border-white/12 bg-white/[0.045] text-white hover:border-white/32 hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  <span className="min-w-0">
                    <span className="block truncate font-body text-[12px] uppercase tracking-[0.12em]">{item.label}</span>
                    {item.value && (
                      <span className={`mt-0.5 block truncate font-body text-[10px] ${active ? "text-black/55" : "text-white/38"}`}>
                        {item.value}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="no-scrollbar flex h-[132px] gap-2 overflow-x-auto pt-1">
            {activeSection === "model" && (
              <>
                {CAR_IDS.map((id) => (
                  <OptionCard
                    key={id}
                    selected={config.model === id}
                    onClick={() => set({ model: id })}
                    preview={<Car className="h-9 w-9" strokeWidth={1.4} />}
                    title={CARS[id].name}
                    subtitle={id === "base-basic-pbr" ? t("config.modelSourcePbr") : t("config.modelMain")}
                  />
                ))}
              </>
            )}

            {activeSection === "exterior" && (
              <>
                {PAINTS.map((paint, index) => (
                  <OptionCard
                    key={paint.id}
                    selected={config.paint === index}
                    onClick={() => set({ paint: index })}
                    preview={<PreviewImage src={PAINT_PREVIEWS[index]} alt={paint.name} fallback={paint.color} />}
                    title={paint.name}
                    subtitle={t("config.exterior")}
                  />
                ))}
                {GRILLE_FINISHES.map((finish, index) => (
                  <OptionCard
                    key={finish.id}
                    selected={config.grille === index}
                    onClick={() => set({ grille: index })}
                    preview={<Swatch color={finish.color} />}
                    title={finish.name}
                    subtitle={t("config.grille")}
                  />
                ))}
              </>
            )}

            {activeSection === "wheels" && (
              <>
                {RIM_DESIGNS.map((rim, index) => (
                  <OptionCard
                    key={rim.id}
                    selected={config.rim === index}
                    onClick={() => set({ rim: index })}
                    preview={<PreviewImage src={RIM_PREVIEWS[index]} alt={rim.name} fallback="#26282b" />}
                    title={rim.name}
                    subtitle={'24"'}
                  />
                ))}
                {RIM_FINISHES.map((finish, index) => (
                  <OptionCard
                    key={finish.id}
                    selected={config.rimFinish === index}
                    onClick={() => set({ rimFinish: index })}
                    preview={<PreviewImage src={FINISH_PREVIEWS[index]} alt={finish.name} fallback={finish.color} />}
                    title={finish.name}
                    subtitle={t("config.rimColor")}
                  />
                ))}
              </>
            )}

            {activeSection === "calipers" && (
              <>
                {CALIPER_FINISHES.map((caliper, index) => (
                  <OptionCard
                    key={caliper.id}
                    selected={config.caliper === index}
                    onClick={() => set({ caliper: index })}
                    preview={<Swatch color={caliper.color} />}
                    title={caliper.name}
                    subtitle="Brake calipers"
                  />
                ))}
              </>
            )}

            {activeSection === "kit" && (
              <>
                {KIT_PACKAGES.map((pack, index) => (
                  <OptionCard
                    key={pack.id}
                    selected={config.kitPackage === index}
                    onClick={() => set({ kitPackage: index, kit: index > 0 })}
                    preview={index === 0 ? <Car className="h-9 w-9" strokeWidth={1.4} /> : <Sparkles className="h-9 w-9" strokeWidth={1.4} />}
                    title={pack.name}
                    subtitle={
                      index === 0
                        ? "Stock version"
                        : `+${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(pack.price)}`
                    }
                  />
                ))}
              </>
            )}

            {activeSection === "carbon" && (
              <>
                <OptionCard
                  selected={!config.carbon}
                  onClick={() => set({ carbon: false })}
                  preview={<Swatch color={PAINTS[config.paint].color} />}
                  title={t("config.carbonOff")}
                  subtitle={t("config.carbon")}
                />
                <OptionCard
                  selected={config.carbon}
                  onClick={() => set({ carbon: true })}
                  preview={<Swatch color="#15161a" />}
                  title={t("config.carbonOn")}
                  subtitle={t("config.carbon")}
                />
              </>
            )}

            {activeSection === "openings" && (
              <>
                <OptionCard
                  selected={config.doors}
                  onClick={() => set({ doors: !config.doors })}
                  preview={<DoorOpen className="h-9 w-9" strokeWidth={1.35} />}
                  title="Open 4 Doors"
                  subtitle={config.doors ? "Open" : "Closed"}
                />
                <OptionCard
                  selected={config.hood}
                  onClick={() => set({ hood: !config.hood })}
                  preview={<Car className="h-9 w-9" strokeWidth={1.35} />}
                  title="Open Hood"
                  subtitle={config.hood ? "Open" : "Closed"}
                />
                <OptionCard
                  selected={config.trunk}
                  onClick={() => set({ trunk: !config.trunk })}
                  preview={<Package className="h-9 w-9" strokeWidth={1.35} />}
                  title="Open Trunk"
                  subtitle={config.trunk ? "Open" : "Closed"}
                />
              </>
            )}

            {activeSection === "lights" && (
              <>
                <OptionCard
                  selected={config.lights}
                  onClick={() => set({ lights: true })}
                  preview={<Lightbulb className="h-9 w-9 text-white" strokeWidth={1.4} />}
                  title={t("config.lightsOn")}
                  subtitle={t("config.lights")}
                />
                <OptionCard
                  selected={!config.lights}
                  onClick={() => set({ lights: false })}
                  preview={<Lightbulb className="h-9 w-9 text-white/42" strokeWidth={1.4} />}
                  title={t("config.lightsOff")}
                  subtitle={t("config.lights")}
                />
              </>
            )}

            {activeSection === "env" && (
              <>
                <OptionCard
                  selected={!config.night}
                  onClick={() => set({ night: false })}
                  preview={<Swatch color="#c7cbce" />}
                  title={t("config.envStudio")}
                  subtitle={t("config.environment")}
                />
                <OptionCard
                  selected={config.night}
                  onClick={() => set({ night: true })}
                  preview={<Swatch color="#0a0a0c" />}
                  title={t("config.envNight")}
                  subtitle={t("config.environment")}
                />
              </>
            )}

            {activeSection === "interior" && (
              <>
                {INTERIOR_FINISHES.map((finish, index) => (
                  <OptionCard
                    key={finish.id}
                    selected={config.interior === index}
                    onClick={() => set({ interior: index })}
                    preview={
                      <span className="flex">
                        <Swatch color={finish.primary} className="relative z-10" />
                        <Swatch color={finish.accent} className="-ml-4" />
                      </span>
                    }
                    title={finish.name}
                    subtitle={
                      index === 0
                        ? t("config.interior")
                        : `+${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(finish.price)}`
                    }
                  />
                ))}
                {interiorViews.map(([view, label]) => (
                  <OptionCard
                    key={view}
                    selected={focus === view}
                    onClick={() => setFocus(view)}
                    preview={<Armchair className="h-9 w-9" strokeWidth={1.35} />}
                    title={label}
                    subtitle={t("config.interior")}
                  />
                ))}
              </>
            )}

            {activeSection === "overview" && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/booking?build=${encodeConfig(config)}`)}
                  className="flex h-[116px] min-w-[210px] flex-col justify-center rounded-md bg-white px-5 text-left text-black transition-colors hover:bg-white/90"
                >
                  <span className="font-body text-[12px] uppercase tracking-[0.18em]">Request this build</span>
                  <span className="mt-2 font-body text-[11px] text-black/48">{formattedPrice}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex h-[116px] min-w-[188px] flex-col justify-center rounded-md border border-white/12 bg-black/35 px-5 text-left text-white transition-colors hover:border-white/35 hover:bg-white/[0.07]"
                >
                  <span className="font-body text-[12px] uppercase tracking-[0.18em]">{config.saved ? "Saved car" : "Save car"}</span>
                  <span className="mt-2 font-body text-[11px] text-white/42">Local garage</span>
                </button>
                {overviewRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex h-[116px] min-w-[188px] max-w-[220px] flex-col justify-between rounded-md border border-white/12 bg-black/35 p-3"
                  >
                    <span className="truncate font-body text-[10px] uppercase tracking-[0.16em] text-white/38">{row.label}</span>
                    <span className="line-clamp-3 font-body text-[13px] leading-snug text-white">{row.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfiguratorPage;
