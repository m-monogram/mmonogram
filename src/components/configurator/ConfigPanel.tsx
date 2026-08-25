import { useState } from "react";
import { Camera, Check, Link2, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BuildConfig, PAINTS, RIM_DESIGNS, RIM_FINISHES, encodeConfig } from "./config";

interface ConfigPanelProps {
  config: BuildConfig;
  onChange: (next: BuildConfig) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] uppercase tracking-[0.28em] text-white/45 mb-2.5">{children}</p>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2.5 text-[11px] font-body uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
        active
          ? "border-white bg-white text-black"
          : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const set = (patch: Partial<BuildConfig>) => onChange({ ...config, ...patch });

  const handleShare = async () => {
    const url = `${location.origin}/configurator?c=${encodeConfig(config)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* без clipboard API просто показываем ссылку в адресной строке — она уже там */
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

  const handleBook = () => {
    navigate("/booking");
  };

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-6">
      {/* Цвет кузова */}
      <div>
        <SectionTitle>{t("config.exterior")}</SectionTitle>
        <div className="flex flex-wrap gap-2.5">
          {PAINTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              title={p.name}
              aria-label={p.name}
              onClick={() => set({ paint: i })}
              className={`relative w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                config.paint === i ? "border-white scale-110" : "border-white/25 hover:border-white/60"
              }`}
              style={{ backgroundColor: p.color }}
            >
              {config.paint === i && (
                <Check className="absolute inset-0 m-auto w-4 h-4 text-white mix-blend-difference" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/50 font-body">{PAINTS[config.paint].name}</p>
      </div>

      {/* Обвес */}
      <div>
        <SectionTitle>{t("config.kit")}</SectionTitle>
        <div className="flex gap-2">
          <PillButton active={!config.kit} onClick={() => set({ kit: false })}>
            {t("config.kitStandard")}
          </PillButton>
          <PillButton active={config.kit} onClick={() => set({ kit: true })}>
            {t("config.kitMM")}
          </PillButton>
        </div>
      </div>

      {/* Карбон */}
      <div>
        <SectionTitle>{t("config.carbon")}</SectionTitle>
        <div className="flex gap-2">
          <PillButton active={!config.carbon} onClick={() => set({ carbon: false })}>
            {t("config.carbonOff")}
          </PillButton>
          <PillButton active={config.carbon} onClick={() => set({ carbon: true })}>
            {t("config.carbonOn")}
          </PillButton>
        </div>
      </div>

      {/* Диски */}
      <div>
        <SectionTitle>{t("config.rims")}</SectionTitle>
        <div className="flex flex-col gap-2">
          {RIM_DESIGNS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => set({ rim: i })}
              className={`flex items-center justify-between px-3 py-2.5 text-[11px] font-body uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                config.rim === i
                  ? "border-white/80 bg-white/10 text-white"
                  : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
              }`}
            >
              <span>{r.name}</span>
              <span
                className={`w-3.5 h-3.5 rounded-full border ${
                  config.rim === i ? "border-white bg-white" : "border-white/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Отделка дисков */}
      <div>
        <SectionTitle>{t("config.rimColor")}</SectionTitle>
        <div className="flex gap-2.5">
          {RIM_FINISHES.map((f, i) => (
            <button
              key={f.id}
              type="button"
              title={f.name}
              aria-label={f.name}
              onClick={() => set({ rimFinish: i })}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                config.rimFinish === i ? "border-white scale-110" : "border-white/25 hover:border-white/60"
              }`}
              style={{ backgroundColor: f.color }}
            />
          ))}
        </div>
      </div>

      {/* Свет и окружение */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionTitle>{t("config.lights")}</SectionTitle>
          <div className="flex gap-2">
            <PillButton active={config.lights} onClick={() => set({ lights: true })}>
              {t("config.lightsOn")}
            </PillButton>
            <PillButton active={!config.lights} onClick={() => set({ lights: false })}>
              {t("config.lightsOff")}
            </PillButton>
          </div>
        </div>
        <div>
          <SectionTitle>{t("config.environment")}</SectionTitle>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("config.envStudio")}
              onClick={() => set({ night: false })}
              className={`flex-1 flex items-center justify-center py-2.5 border transition-all cursor-pointer ${
                !config.night ? "border-white bg-white text-black" : "border-white/20 text-white/70 hover:border-white/50"
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={t("config.envNight")}
              onClick={() => set({ night: true })}
              className={`flex-1 flex items-center justify-center py-2.5 border transition-all cursor-pointer ${
                config.night ? "border-white bg-white text-black" : "border-white/20 text-white/70 hover:border-white/50"
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-body uppercase tracking-wider border border-white/25 text-white/80 hover:border-white/60 hover:text-white transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
            {copied ? t("config.shareCopied") : t("config.share")}
          </button>
          <button
            type="button"
            onClick={handleScreenshot}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-body uppercase tracking-wider border border-white/25 text-white/80 hover:border-white/60 hover:text-white transition-all cursor-pointer"
            aria-label={t("config.screenshot")}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleBook}
          className="w-full px-3 py-3 text-[11px] font-body uppercase tracking-[0.2em] bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
        >
          {t("config.book")}
        </button>
      </div>
    </div>
  );
}
