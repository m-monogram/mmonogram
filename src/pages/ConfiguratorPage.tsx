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
import { CARS, DEFAULT_CAR, selectableCarIds } from "@/components/configurator/models";

const ConfiguratorScene = lazy(() => import("@/components/configurator/Scene"));

/** Ракурсы, доступные в разделе «Салон». */
type InteriorView = Extract<CameraFocus, "interiorFront" | "interiorDriver" | "interiorRear">;

const FOCUS_VALUES: CameraFocus[] = [
  "default", "exterior", "wheels", "kit", "carbon", "lights", "env",
  "interiorFront", "interiorDriver", "interiorRear",
];

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
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [focus, setFocus] = useState<CameraFocus>(() => {
    const v = searchParams.get("v");
    return v && (FOCUS_VALUES as string[]).includes(v) ? (v as CameraFocus) : "default";
  });

  /** Машины в публичном выборе; референсные — только с ?dev=1. */
  const carIds = useMemo(() => selectableCarIds(), []);
  const car = CARS[config.model] ?? CARS[DEFAULT_CAR];
  /* У оцифрованного кузова двери из одного меша не вынуть, и раздел
     «Openings» раньше подменял всю машину процедурной заглушкой. */
  const canOpen = !!car.supportsOpenings;

  /* Ракурс держим в адресе рядом со сборкой: страница его читает при загрузке,
     а до этого записывала только код сборки — присланная ссылка открывалась
     не с того вида, с которого её отправили. */
  const syncUrl = useCallback(
    (next: BuildConfig, nextFocus: CameraFocus) => {
      const params: Record<string, string> = { c: encodeConfig(next) };
      if (nextFocus !== "default") params.v = nextFocus;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  /* Одна точка применения состояния: и сборка, и ракурс кладутся в адрес
     вместе. Раздельные обработчики читали config из замыкания, и «Сброс»,
     менявший то и другое за один тик, записывал в ссылку сборку, которую
     только что сбросил, — обновление страницы возвращало её обратно. */
  const apply = useCallback(
    (nextConfig: BuildConfig, nextFocus: CameraFocus) => {
      setConfig(nextConfig);
      setFocus(nextFocus);
      syncUrl(nextConfig, nextFocus);
    },
    [syncUrl]
  );

  const handleChange = useCallback((next: BuildConfig) => apply(next, focus), [apply, focus]);

  const changeFocus = useCallback((next: CameraFocus) => apply(config, next), [apply, config]);

  const set = useCallback((patch: Partial<BuildConfig>) => handleChange({ ...config, ...patch }), [config, handleChange]);

  const focusForSection = (section: StudioSection): CameraFocus =>
    section === "interior" ? "interiorDriver" : SECTION_FOCUS[section] ?? "default";

  const chooseSection = useCallback(
    (section: StudioSection) => {
      setActiveSection(section);
      changeFocus(focusForSection(section));
    },
    [changeFocus]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleShare = useCallback(async () => {
    const params = new URLSearchParams({ c: encodeConfig(config) });
    if (focus !== "default") params.set("v", focus);
    const url = `${location.origin}/configurator?${params}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* Буфер обмена недоступен во встроенных контекстах и без https.
         Раньше кнопка всё равно показывала «скопировано», и посетитель
         вставлял в мессенджер то, что было в буфере до неё. */
      setShareUrl(url);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [config, focus]);

  const price = getBuildPrice(config);
  const formattedPrice = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price),
    [price]
  );

  const handleSave = useCallback(() => {
    /* Чужая запись под тем же ключом или приватный режим не должны ронять
       страницу: раньше JSON.parse на мусоре выбрасывал прямо из обработчика
       и «Сохранить» переставало работать до очистки хранилища. */
    let saved: Array<{ code: string; savedAt: string; price: number }> = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("mmonogram-builds") ?? "[]");
      if (Array.isArray(parsed)) saved = parsed.filter((item) => item && typeof item.code === "string");
    } catch {
      saved = [];
    }
    const code = encodeConfig(config);
    const next = [{ code, savedAt: new Date().toISOString(), price }, ...saved.filter((item) => item.code !== code)].slice(0, 12);
    try {
      localStorage.setItem("mmonogram-builds", JSON.stringify(next));
    } catch {
      /* Квота или запрет хранилища — сборка всё равно живёт в ссылке. */
    }
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
    setActiveSection("exterior");
    apply(DEFAULT_CONFIG, focusForSection("exterior"));
  }, [apply]);

  const handleFullscreen = useCallback(() => {
    const root = document.documentElement;
    if (!document.fullscreenElement) root.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const sections = useMemo(
    () => ([
      /* Раздел выбора машины прячем, когда выбирать не из чего: одна карточка
         с единственной моделью занимала место и выглядела недоделкой. */
      ...(carIds.length > 1
        ? [{ id: "model" as const, label: t("config.model"), value: car.name, icon: Car }]
        : []),
      { id: "exterior" as const, label: t("config.exterior"), value: PAINTS[config.paint].name, icon: Palette },
      { id: "wheels" as const, label: t("config.rims"), value: RIM_DESIGNS[config.rim].name, icon: Disc3 },
      { id: "calipers" as const, label: "Calipers", value: CALIPER_FINISHES[config.caliper].name, icon: Disc3 },
      { id: "kit" as const, label: t("config.kit"), value: KIT_PACKAGES[config.kitPackage].name, icon: Package },
      { id: "carbon" as const, label: t("config.carbon"), value: config.carbon ? t("config.carbonOn") : t("config.carbonOff"), icon: Gem },
      ...(canOpen
        ? [{ id: "openings" as const, label: "Openings", value: [config.doors && "Doors", config.hood && "Hood", config.trunk && "Trunk"].filter(Boolean).join(" · ") || "Closed", icon: DoorOpen }]
        : []),
      { id: "lights" as const, label: t("config.lights"), value: config.lights ? t("config.lightsOn") : t("config.lightsOff"), icon: Lightbulb },
      { id: "env" as const, label: t("config.environment"), value: config.night ? t("config.envNight") : t("config.envStudio"), icon: SunMoon },
      { id: "interior" as const, label: t("config.interior"), value: INTERIOR_FINISHES[config.interior].name, icon: Armchair },
      { id: "overview" as const, label: t("config.overview"), value: "", icon: ClipboardList },
    ]),
    [canOpen, car.name, carIds.length, config, t]
  );

  const overviewRows = [
    { label: t("config.model"), value: car.name },
    { label: t("config.exterior"), value: `${PAINTS[config.paint].name} · ${GRILLE_FINISHES[config.grille].name}` },
    { label: t("config.rims"), value: `${RIM_DESIGNS[config.rim].name} · ${RIM_FINISHES[config.rimFinish].name}` },
    { label: "Calipers", value: CALIPER_FINISHES[config.caliper].name },
    { label: t("config.kit"), value: KIT_PACKAGES[config.kitPackage].name },
    { label: t("config.carbon"), value: config.carbon ? t("config.carbonOn") : t("config.carbonOff") },
    { label: t("config.lights"), value: config.lights ? t("config.lightsOn") : t("config.lightsOff") },
    { label: t("config.environment"), value: config.night ? t("config.envNight") : t("config.envStudio") },
    { label: t("config.interior"), value: INTERIOR_FINISHES[config.interior].name },
    ...(canOpen
      ? [{ label: "Openings", value: [config.doors && "4 doors", config.hood && "hood", config.trunk && "trunk"].filter(Boolean).join(" · ") || "closed" }]
      : []),
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
        className={`pointer-events-none absolute bottom-[15.5rem] left-4 z-20 hidden md:block ${
          config.night ? "text-white/40" : "text-black/45"
        }`}
      >
        <p className="font-body text-[10px] uppercase tracking-[0.14em]">
          {t("config.demoNote")} · {car.name}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-[15.25rem] right-4 z-20 hidden md:flex items-center gap-2 rounded-md border border-white/10 bg-black/45 px-3 py-2 text-white/85 backdrop-blur-xl">
        <DollarSign className="h-4 w-4 text-white/48" />
        <span className="font-body text-[12px] uppercase tracking-[0.12em]">{formattedPrice}</span>
      </div>

      {shareUrl && (
        <div className="absolute inset-x-0 top-[8.5rem] z-30 flex justify-center px-4">
          <div className="flex w-full max-w-lg items-center gap-2 rounded-md border border-white/15 bg-black/85 px-3 py-2 backdrop-blur-xl">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              aria-label={t("config.share")}
              className="min-w-0 flex-1 bg-transparent font-body text-[11px] text-white/80 outline-none"
            />
            <button
              type="button"
              onClick={() => setShareUrl(null)}
              className="shrink-0 font-body text-[10px] uppercase tracking-[0.16em] text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
                  className={`flex h-[58px] min-w-[196px] items-center gap-2 rounded-md border px-3 text-left transition-all ${
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
                {carIds.map((id) => (
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

            {activeSection === "openings" && canOpen && (
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
                    onClick={() => changeFocus(view)}
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
