import { Html, useProgress } from "@react-three/drei";

/**
 * Индикатор загрузки на месте машины.
 *
 * Раньше на это время в сцену ставилась процедурная заглушка: посетитель
 * видел грубую машину, а через несколько секунд она подменялась настоящей —
 * выглядело так, будто сначала показали старую модель. Пустая сцена вместо
 * неё выглядела бы поломкой, поэтому здесь честный прогресс: сколько уже
 * скачано из моделей и окружения.
 */
export default function SceneLoader({ night }: { night: boolean }) {
  const { progress } = useProgress();
  /* До 100 доводит появление самой машины, а не счётчик: последние проценты
     уходят на разбор Draco, и замерший на 100% индикатор читается как зависший. */
  const percent = Math.min(99, Math.round(progress));

  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex w-[190px] flex-col items-center gap-3">
          <p
            className={`font-display text-[10px] uppercase tracking-[0.3em] ${
              night ? "text-white/55" : "text-black/50"
            }`}
          >
            Loading 3D model
          </p>
          <div className={`h-px w-full overflow-hidden ${night ? "bg-white/15" : "bg-black/15"}`}>
            <div
              className={`h-full transition-[width] duration-200 ease-out ${night ? "bg-white/70" : "bg-black/55"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p
            className={`font-body text-[10px] tabular-nums ${night ? "text-white/40" : "text-black/40"}`}
          >
            {percent}%
          </p>
        </div>
      </div>
    </Html>
  );
}
