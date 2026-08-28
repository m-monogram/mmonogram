import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const AUDIO_SRC = "/audio/garage-theme.mp3";
const STORAGE_KEY = "mmonogram-studio-sound";
const VOLUME = 0.35;

/**
 * Фоновый трек студии.
 *
 * Кнопка появляется, только если файл действительно лежит в public/audio:
 * пока трека нет, в панели не должно быть кнопки, которая ничего не делает.
 *
 * Наличие проверяем запросом HEAD и обязательно смотрим content-type. Одного
 * кода 200 мало: на Vercel и Netlify любой несуществующий путь переписывается
 * в index.html и отвечает двумястами — по коду ответа отсутствующий файл
 * выглядел бы как существующий.
 *
 * Сам трек не грузится, пока его не попросят: preload="none", и запрос уходит
 * только по нажатию. Звук по умолчанию выключен — браузер и так не даст
 * запустить его без действия посетителя, но дело не в этом: человек пришёл
 * крутить машину, решать за него нельзя.
 */
export default function StudioAudio() {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    void fetch(AUDIO_SRC, { method: "HEAD", signal: abort.signal })
      .then((response) => {
        const type = response.headers.get("content-type") ?? "";
        setAvailable(response.ok && type.startsWith("audio/"));
      })
      .catch(() => undefined);
    return () => abort.abort();
  }, []);

  const toggle = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        localStorage.setItem(STORAGE_KEY, "off");
      } catch {
        /* приватный режим или запрет хранилища — не повод ломать кнопку */
      }
      return;
    }

    audio.volume = VOLUME;
    void audio
      .play()
      .then(() => {
        setPlaying(true);
        try {
          localStorage.setItem(STORAGE_KEY, "on");
        } catch {
          /* см. выше */
        }
      })
      .catch(() => setPlaying(false));
  }, [playing]);

  if (!available) return null;

  return (
    <>
      <audio ref={ref} src={AUDIO_SRC} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        title={playing ? "Выключить музыку" : "Включить музыку"}
        aria-label={playing ? "Выключить музыку" : "Включить музыку"}
        aria-pressed={playing}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/12 bg-black/55 text-white/80 shadow-[0_12px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-colors hover:border-white/36 hover:bg-white/12 hover:text-white"
      >
        {playing ? <Volume2 className="h-[18px] w-[18px]" /> : <VolumeX className="h-[18px] w-[18px]" />}
      </button>
    </>
  );
}
