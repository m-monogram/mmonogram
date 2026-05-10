import { ContentBlock } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  blocks: ContentBlock[];
}

const NewsContentRenderer = ({ blocks }: Props) => {
  const { language } = useLanguage();

  // Index of the first paragraph — we apply a drop cap to it (editorial feel)
  const firstParagraphIdx = blocks.findIndex((b) => b.type === "paragraph");

  return (
    <div className="space-y-9">
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          const isLead = i === firstParagraphIdx;
          return (
            <p
              key={i}
              className={`font-body text-base sm:text-lg text-white/80 leading-[1.85] tracking-[0.005em] ${
                isLead
                  ? "first-letter:font-display first-letter:float-left first-letter:text-[64px] sm:first-letter:text-[88px] first-letter:leading-[0.85] first-letter:mr-3 first-letter:mt-1 first-letter:text-white"
                  : ""
              }`}
            >
              {block.text[language]}
            </p>
          );
        }
        if (block.type === "heading") {
          return (
            <h2
              key={i}
              className="font-display text-2xl sm:text-3xl md:text-4xl text-white tracking-tight pt-6 border-t border-white/10"
            >
              {block.text[language]}
            </h2>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={i} className="my-12 -mx-4 sm:mx-0">
              <div className="relative overflow-hidden border border-white/10 bg-slate-900/30">
                <img
                  src={block.src}
                  alt={block.alt?.[language] || ""}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
              {block.alt?.[language] && (
                <figcaption className="mt-3 px-4 sm:px-0 font-display text-[11px] uppercase tracking-[0.25em] text-white/45">
                  {block.alt[language]}
                </figcaption>
              )}
            </figure>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-12 relative pl-8 sm:pl-12 py-2"
            >
              <span
                aria-hidden="true"
                className="absolute -left-1 -top-4 font-display text-[120px] leading-none text-white/10 select-none pointer-events-none"
              >
                “
              </span>
              <p className="font-display text-xl sm:text-2xl md:text-3xl text-white leading-snug italic tracking-tight">
                {block.text[language]}
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
