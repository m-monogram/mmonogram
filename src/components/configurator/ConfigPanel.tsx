import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Armchair,
  Hexagon,
  Lightbulb,
  Link2,
  Palette,
  SunMoon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BuildConfig, GRILLE_FINISHES, PAINTS, RIM_DESIGNS, RIM_FINISHES, encodeConfig } from "./config";

/* Превью опций — кадры реальной 3D-модели (§ ТЗ: картинки вместо кружков).
   Генерируются скриптом скриншотов по ?c=...&v=... */
const PAINT_PREVIEWS = Object.values(
  import.meta.glob("@/assets/previews/paint-*.jpg", { eager: true, import: "default" })
) as string[];
const RIM_PREVIEWS = Object.values(
  import.meta.glob("@/assets/previews/rim-*.jpg", { eager: true, import: "default" })
) as string[];
const FINISH_PREVIEWS = Object.values(
  import.meta.glob("@/assets/previews/finish-*.jpg", { eager: true, import: "default" })
) as string[];

export type Section = "exterior" | "wheels" | "kit" | "carbon" | "lights" | "env" | "interior" | "overview";

/* Раздел «Интерьер» — это не опции, а три ракурса внутри салона, как у Mansory */
export type InteriorView = "interiorFront" | "interiorDriver" | "interiorRear";

interface ConfigPanelProps {
  config: BuildConfig;
  onChange: (next: BuildConfig) => void;
  /* Сообщаем странице, какой раздел открыт — камера подлетает к нужной детали */
  onSectionChange?: (section: Section | null) => void;
  /* Выбранный ракурс салона — камера залетает внутрь */
  onInteriorView?: (view: InteriorView) => void;
}

/* Схематичная иконка дизайна диска */
function WheelIcon({ design, className = "w-9 h-9" }: { design: number; className?: string }) {
  const marks: JSX.Element[] = [];
  if (design === 0) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      marks.push(
        <circle key={i} cx={20 + Math.cos(a) * 10.5} cy={20 + Math.sin(a) * 10.5} r="1.7" fill="currentColor" />
      );
    }
    marks.push(<circle key="disc" cx="20" cy="20" r="13.5" fill="none" stroke="currentColor" strokeWidth="1.2" />);
  } else if (design === 1) {
    for (let i = 0; i < 12; i++) {
      marks.push(
        <line key={i} x1="20" y1="15" x2="20" y2="5.5" stroke="currentColor" strokeWidth="1.6" transform={`rotate(${i * 30} 20 20)`} />
      );
    }
  } else {
    for (let i = 0; i < 6; i++) {
      marks.push(
        <g key={i} transform={`rotate(${i * 60} 20 20)`}>
          <line x1="18.4" y1="14.5" x2="17" y2="5.8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="21.6" y1="14.5" x2="23" y2="5.8" stroke="currentColor" strokeWidth="1.5" />
        </g>
      );
    }
  }
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="16.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="20" r="3.4" fill="currentColor" />
      {marks}
    </svg>
  );
}

/* Радио-индикатор как в референсе */
function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`ml-auto w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-colors ${
        selected ? "border-white" : "border-white/30"
      }`}
    >
      {selected && <span className="w-2 h-2 rounded-full bg-white" />}
    </span>
  );
}

/* Строка-опция внутри категории: превью, название, радио */
function OptionRow({
  selected,
  onClick,
  preview,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  preview: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-3.5 py-3 border transition-all duration-200 cursor-pointer text-left ${
        selected
          ? "border-white/60 bg-white/[0.08]"
          : "border-white/10 hover:border-white/30 hover:bg-white/[0.03]"
      }`}
    >
      {preview}
      <span className="min-w-0">
        <span className="block font-body text-[13px] text-white/90 truncate">{label}</span>
        {sub && <span className="block font-body text-[10px] uppercase tracking-[0.12em] text-white/35 mt-0.5">{sub}</span>}
      </span>
      <Radio selected={selected} />
    </button>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 mt-1">{children}</p>
  );
}

function Swatch({ color }: { color: string }) {
  return <span className="w-8 h-8 rounded-full shrink-0 ring-1 ring-white/20" style={{ backgroundColor: color }} />;
}

/* Карточка-превью с кадром модели; при отсутствии кадра — цветовой кружок */
function Thumb({ src, alt, fallback }: { src?: string; alt: string; fallback: string }) {
  if (!src) return <Swatch color={fallback} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-[68px] h-[42px] shrink-0 rounded-md object-cover ring-1 ring-white/15"
    />
  );
}

export default function ConfigPanel({ config, onChange, onSectionChange, onInteriorView }: ConfigPanelProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [section, setSectionState] = useState<Section | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [interiorView, setInteriorView] = useState<InteriorView>("interiorFront");
  const setSection = (s: Section | null) => {
    setSectionState(s);
    // Ровно один источник ракурса на клик: два setFocus в одном обработчике
    // конфликтовали, и камера отставала на шаг.
    if (s === "interior") onInteriorView?.(interiorView);
    else onSectionChange?.(s);
    // На мобильном лист прокручен — новый раздел должен открываться с начала
    rootRef.current?.closest("aside")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (patch: Partial<BuildConfig>) => onChange({ ...config, ...patch });

  const handleShare = async () => {
    const url = `${location.origin}/configurator?c=${encodeConfig(config)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* без clipboard API ссылка уже в адресной строке */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector<HTMLCanvasElement>("#configurator-canvas canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `m-monogram-build-${encodeConfig(config)}.png`;
    a.click();
  };

  const rootItems: { id: Section; icon: React.ReactNode; label: string; value: string }[] = [
    { id: "exterior", icon: <Palette className="w-[18px] h-[18px]" />, label: t("config.exterior"), value: `${PAINTS[config.paint].name} · ${GRILLE_FINISHES[config.grille].name}` },
    { id: "wheels", icon: <WheelIcon design={config.rim} className="w-5 h-5" />, label: t("config.rims"), value: RIM_DESIGNS[config.rim].name },
    { id: "kit", icon: <Car className="w-[18px] h-[18px]" />, label: t("config.kit"), value: config.kit ? t("config.kitMM") : t("config.kitStandard") },
    { id: "carbon", icon: <Hexagon className="w-[18px] h-[18px]" />, label: t("config.carbon"), value: config.carbon ? t("config.carbonOn") : t("config.carbonOff") },
    { id: "lights", icon: <Lightbulb className="w-[18px] h-[18px]" />, label: t("config.lights"), value: config.lights ? t("config.lightsOn") : t("config.lightsOff") },
    { id: "env", icon: <SunMoon className="w-[18px] h-[18px]" />, label: t("config.environment"), value: config.night ? t("config.envNight") : t("config.envStudio") },
    { id: "interior", icon: <Armchair className="w-[18px] h-[18px]" />, label: t("config.interior"), value: "" },
    { id: "overview", icon: <ClipboardList className="w-[18px] h-[18px]" />, label: t("config.overview"), value: "" },
  ];

  const overviewRows: { label: string; value: string }[] = [
    { label: t("config.exterior"), value: PAINTS[config.paint].name },
    { label: t("config.rims"), value: `${RIM_DESIGNS[config.rim].name} · ${RIM_FINISHES[config.rimFinish].name}` },
    { label: t("config.kit"), value: config.kit ? t("config.kitMM") : t("config.kitStandard") },
    { label: t("config.carbon"), value: config.carbon ? t("config.carbonOn") : t("config.carbonOff") },
    { label: t("config.lights"), value: config.lights ? t("config.lightsOn") : t("config.lightsOff") },
    { label: t("config.environment"), value: config.night ? t("config.envNight") : t("config.envStudio") },
  ];

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {section === null ? (
          /* ---------- Уровень 1: список категорий ---------- */
          <motion.div
            key="root"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col p-2"
          >
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {rootItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className="group flex items-center gap-3 px-3 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left min-w-0"
                >
                  <span className="text-white/50 group-hover:text-white/80 transition-colors shrink-0">{item.icon}</span>
                  <span className="font-body text-sm text-white/90 whitespace-nowrap">{item.label}</span>
                  <span className="ml-auto min-w-0 font-body text-[10px] uppercase tracking-[0.1em] text-white/35 text-right truncate">
                    {item.value}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition-colors shrink-0" />
                </button>
              ))}

              {/* Поделиться и скриншот */}
              <button
                type="button"
                onClick={handleShare}
                className="group flex items-center gap-3 px-3 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left min-w-0"
              >
                <span className="text-white/50 group-hover:text-white/80 transition-colors shrink-0">
                  {copied ? <Check className="w-[18px] h-[18px]" /> : <Link2 className="w-[18px] h-[18px]" />}
                </span>
                <span className="font-body text-sm text-white/90">{copied ? t("config.shareCopied") : t("config.share")}</span>
              </button>
              <button
                type="button"
                onClick={handleScreenshot}
                className="group flex items-center gap-3 px-3 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left min-w-0"
              >
                <span className="text-white/50 group-hover:text-white/80 transition-colors shrink-0">
                  <Camera className="w-[18px] h-[18px]" />
                </span>
                <span className="font-body text-sm text-white/90">{t("config.screenshot")}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/booking?build=${encodeConfig(config)}`)}
              className="mt-2.5 w-full py-3.5 font-body text-[10px] uppercase tracking-[0.22em] bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              {t("config.book")}
            </button>
          </motion.div>
        ) : (
          /* ---------- Уровень 2: опции категории ---------- */
          <motion.div
            key={section}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col p-4"
          >
            <div className="flex flex-col gap-2 max-h-[52vh] md:max-h-[58vh] overflow-y-auto pr-0.5">
              {section === "exterior" && (
                <>
                  <GroupTitle>{t("config.exterior")}</GroupTitle>
                  {PAINTS.map((p, i) => (
                    <OptionRow
                      key={p.id}
                      selected={config.paint === i}
                      onClick={() => set({ paint: i })}
                      preview={<Thumb src={PAINT_PREVIEWS[i]} alt={p.name} fallback={p.color} />}
                      label={p.name}
                    />
                  ))}
                  <GroupTitle>{t("config.grille")}</GroupTitle>
                  {GRILLE_FINISHES.map((g, i) => (
                    <OptionRow
                      key={g.id}
                      selected={config.grille === i}
                      onClick={() => set({ grille: i })}
                      preview={<Thumb src={undefined} alt={g.name} fallback={g.color} />}
                      label={g.name}
                    />
                  ))}
                </>
              )}

              {section === "wheels" && (
                <>
                  <GroupTitle>{t("config.rims")}</GroupTitle>
                  {RIM_DESIGNS.map((r, i) => (
                    <OptionRow
                      key={r.id}
                      selected={config.rim === i}
                      onClick={() => set({ rim: i })}
                      preview={<Thumb src={RIM_PREVIEWS[i]} alt={r.name} fallback="#26282b" />}
                      label={r.name}
                      sub={'24"'}
                    />
                  ))}
                  <GroupTitle>{t("config.rimColor")}</GroupTitle>
                  {RIM_FINISHES.map((f, i) => (
                    <OptionRow
                      key={f.id}
                      selected={config.rimFinish === i}
                      onClick={() => set({ rimFinish: i })}
                      preview={<Thumb src={FINISH_PREVIEWS[i]} alt={f.name} fallback={f.color} />}
                      label={f.name}
                    />
                  ))}
                </>
              )}

              {section === "kit" && (
                <>
                  <GroupTitle>{t("config.kit")}</GroupTitle>
                  <OptionRow
                    selected={!config.kit}
                    onClick={() => set({ kit: false })}
                    preview={<span className="text-white/60 shrink-0"><Car className="w-7 h-7" strokeWidth={1.5} /></span>}
                    label={t("config.kitStandard")}
                  />
                  <OptionRow
                    selected={config.kit}
                    onClick={() => set({ kit: true })}
                    preview={<span className="text-white/60 shrink-0"><Car className="w-7 h-7" strokeWidth={1.5} /></span>}
                    label={t("config.kitMM")}
                  />
                </>
              )}

              {section === "carbon" && (
                <>
                  <GroupTitle>{t("config.carbon")}</GroupTitle>
                  <OptionRow
                    selected={!config.carbon}
                    onClick={() => set({ carbon: false })}
                    preview={<Swatch color={PAINTS[config.paint].color} />}
                    label={t("config.carbonOff")}
                  />
                  <OptionRow
                    selected={config.carbon}
                    onClick={() => set({ carbon: true })}
                    preview={<Swatch color="#1a1b1f" />}
                    label={t("config.carbonOn")}
                  />
                </>
              )}

              {section === "lights" && (
                <>
                  <GroupTitle>{t("config.lights")}</GroupTitle>
                  <OptionRow
                    selected={config.lights}
                    onClick={() => set({ lights: true })}
                    preview={<span className="text-white/75 shrink-0"><Lightbulb className="w-7 h-7" strokeWidth={1.5} /></span>}
                    label={t("config.lightsOn")}
                  />
                  <OptionRow
                    selected={!config.lights}
                    onClick={() => set({ lights: false })}
                    preview={<span className="text-white/40 shrink-0"><Lightbulb className="w-7 h-7" strokeWidth={1.5} /></span>}
                    label={t("config.lightsOff")}
                  />
                </>
              )}

              {section === "interior" && (
                <>
                  <GroupTitle>{t("config.interior")}</GroupTitle>
                  {([
                    ["interiorFront", t("config.interiorFront")],
                    ["interiorDriver", t("config.interiorDriver")],
                    ["interiorRear", t("config.interiorRear")],
                  ] as [InteriorView, string][]).map(([id, label]) => (
                    <OptionRow
                      key={id}
                      selected={interiorView === id}
                      onClick={() => {
                        setInteriorView(id);
                        onInteriorView?.(id);
                      }}
                      preview={<span className="text-white/70 shrink-0"><Armchair className="w-7 h-7" strokeWidth={1.4} /></span>}
                      label={label}
                    />
                  ))}
                  <p className="mt-1 font-body text-[10px] text-white/35 leading-relaxed">
                    {t("config.interiorHint")}
                  </p>
                </>
              )}

              {section === "overview" && (
                <>
                  <GroupTitle>{t("config.overview")}</GroupTitle>
                  <div className="flex flex-col divide-y divide-white/[0.07] border border-white/10">
                    {overviewRows.map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between gap-3 px-3.5 py-3">
                        <span className="font-display text-[9px] uppercase tracking-[0.22em] text-white/40 shrink-0">{row.label}</span>
                        <span className="font-body text-[12px] text-white/90 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 font-body text-[10px] text-white/30 break-all">
                    {`${location.origin}/configurator?c=${encodeConfig(config)}`}
                  </p>
                </>
              )}

              {section === "env" && (
                <>
                  <GroupTitle>{t("config.environment")}</GroupTitle>
                  <OptionRow
                    selected={!config.night}
                    onClick={() => set({ night: false })}
                    preview={<Swatch color="#c7cbce" />}
                    label={t("config.envStudio")}
                  />
                  <OptionRow
                    selected={config.night}
                    onClick={() => set({ night: true })}
                    preview={<Swatch color="#0a0a0c" />}
                    label={t("config.envNight")}
                  />
                </>
              )}
            </div>

            {/* Назад — как в референсе, отдельной полосой внизу */}
            <button
              type="button"
              onClick={() => setSection(null)}
              className="mt-4 w-full flex items-center justify-between px-4 py-3.5 border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/35 transition-all cursor-pointer"
            >
              <span className="font-body text-sm text-white/85">{t("common.back")}</span>
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
