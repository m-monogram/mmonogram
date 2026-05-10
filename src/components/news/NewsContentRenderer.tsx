import { ContentBlock } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  blocks: ContentBlock[];
}

const NewsContentRenderer = ({ blocks }: Props) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={i}
              className="font-body text-base sm:text-lg text-white/75 leading-[1.85] tracking-[0.005em]"
            >
              {block.text[language]}
            </p>
          );
        }
        if (block.type === "heading") {
          return (
            <h2
              key={i}
              className="font-display text-2xl sm:text-3xl md:text-4xl text-white tracking-tight pt-4"
            >
              {block.text[language]}
            </h2>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={i} className="my-10 -mx-4 sm:mx-0">
              <div className="relative overflow-hidden border border-white/10">
                <img
                  src={block.src}
                  alt={block.alt?.[language] || ""}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
            </figure>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-10 border-l-2 border-white/40 pl-6 sm:pl-8 py-2"
            >
              <p className="font-display text-xl sm:text-2xl md:text-3xl text-white/95 leading-snug italic tracking-tight">
                "{block.text[language]}"
              </p>
              {block.author && (
                <footer className="mt-4 font-display text-[11px] uppercase tracking-[0.25em] text-white/45">
                  — {block.author}
                </footer>
              )}
            </blockquote>
          );
        }
        return null;
      })}
    </div>
  );
};

export default NewsContentRenderer;
