import cover from "@/assets/news/m-monogram-g-iconic/01-cover.jpeg";
import frontGrille from "@/assets/news/m-monogram-g-iconic/02-front-grille.jpeg";
import binz1950 from "@/assets/news/m-monogram-g-iconic/03-binz-1950.jpeg";
import amgBase from "@/assets/news/m-monogram-g-iconic/04-amg-base.jpeg";
import grilleRetro from "@/assets/news/m-monogram-g-iconic/05-grille-retro.jpeg";
import aero from "@/assets/news/m-monogram-g-iconic/06-aero.jpeg";
import fiftyUnits from "@/assets/news/m-monogram-g-iconic/07-50-units.jpeg";
import price from "@/assets/news/m-monogram-g-iconic/08-price.jpeg";
import frontBlack from "@/assets/news/m-monogram-g-iconic/09-front-black.jpeg";

export type NewsCategory = "news" | "event" | "press";

export type LocalizedString = {
  en: string;
  ru: string;
  ar: string;
};

export type ContentBlock =
  | { type: "paragraph"; text: LocalizedString }
  | { type: "heading"; text: LocalizedString }
  | { type: "image"; src: string; alt?: LocalizedString }
  | { type: "quote"; text: LocalizedString; author?: string };

export interface NewsItem {
  slug: string;
  category: NewsCategory;
  publishedAt: string; // ISO
  cover: string;
  gallery?: string[];
  title: LocalizedString;
  excerpt: LocalizedString;
  content: ContentBlock[];
  author?: string;
  eventDate?: string;
  location?: string;
}

export const NEWS: NewsItem[] = [
  {
    slug: "m-monogram-g-3-0-iconic",
    category: "news",
    publishedAt: "2026-05-13",
    cover,
    gallery: [cover, frontGrille, amgBase, grilleRetro, aero, fiftyUnits, frontBlack],
    author: "MetaGarage Atelier",
    location: "Dubai, UAE",
    title: {
      en: "M Monogram G 3.0 Iconic — A G-Wagen Reimagined in the Spirit of Classic Mercedes",
      ru: "M Monogram G 3.0 Iconic — Гелик в стиле классических Мерседесов",
      ar: "إم مونوغرام جي 3.0 آيكونيك — جي-فاغن بروح مرسيدس الكلاسيكية",
    },
    excerpt: {
      en: "MetaGarage unveils a strictly limited reinterpretation of the AMG G63 — inspired by the rare 1950s Mercedes by Binz, hand-built in Dubai, capped at fifty examples worldwide.",
      ru: "MetaGarage представил лимитированную переработку AMG G63, вдохновлённую редким универсалом Mercedes от Binz из 1950-х. Ручная сборка в Дубае, всего 50 экземпляров.",
      ar: "تكشف ميتاغاراج عن إعادة تصور محدودة للغاية لطراز AMG G63 — مستوحاة من مرسيدس النادرة من Binz في الخمسينيات، مصنوعة يدوياً في دبي، محدودة بخمسين نسخة عالمياً.",
    },
    content: [
      {
        type: "paragraph",
        text: {
          en: "MetaGarage — the Dubai-based atelier founded by Russian designer Alexey Gashkov — has revealed its most ambitious project to date: the M Monogram G 3.0 Iconic. The brief was as bold as it sounds. Take the AMG G63, strip it back to silhouette, and rebuild it in the language of the great post-war Mercedes coachbuilders.",
          ru: "MetaGarage — ателье из Дубая, основанное российским дизайнером Алексеем Гашковым — представило свой самый амбициозный проект: M Monogram G 3.0 Iconic. Задача стояла дерзкая: взять AMG G63, разобрать до силуэта и пересобрать на языке великих послевоенных кузовщиков Mercedes.",
          ar: "كشفت ميتاغاراج — الأتيليه ومقره دبي والذي أسسه المصمم الروسي أليكسي غاشكوف — عن أكثر مشاريعها طموحاً حتى الآن: إم مونوغرام جي 3.0 آيكونيك. كانت المهمة جريئة بقدر ما تبدو: أخذ AMG G63، تجريده إلى الصورة الظلية، وإعادة بنائه بلغة كبار صانعي هياكل مرسيدس في فترة ما بعد الحرب.",
        },
      },
      {
        type: "image",
        src: frontBlack,
        alt: {
          en: "M Monogram G 3.0 Iconic — front view, matte black finish",
          ru: "M Monogram G 3.0 Iconic — вид спереди, матовый чёрный",
          ar: "إم مونوغرام جي 3.0 آيكونيك — منظر أمامي، أسود مطفأ",
        },
      },
      {
        type: "heading",
        text: {
          en: "Inspired by a 1950s Mercedes by Binz",
          ru: "Вдохновение — Mercedes от Binz из 1950-х",
          ar: "مستوحاة من مرسيدس بنز في الخمسينيات",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "The reference is unusual. In the 1950s the German coachbuilder Binz produced a handful of long, elegant Mercedes estates for clients who wanted a saloon's grace with a wagon's purpose. That single car — proportional, restrained, unmistakably mid-century — became the visual North Star of the Iconic project.",
          ru: "Референс неожиданный. В 1950-х немецкий кузовной ателье Binz собрало несколько длинных и элегантных универсалов на базе Mercedes для тех, кто хотел грацию седана с практичностью универсала. Именно эта машина — пропорциональная, сдержанная, безошибочно середины века — стала визуальным ориентиром для Iconic.",
          ar: "المرجع غير عادي. في الخمسينيات، أنتج صانع الهياكل الألماني Binz عدداً قليلاً من سيارات مرسيدس الطويلة والأنيقة لعملاء أرادوا أناقة السيدان مع وظيفة الستيشن. تلك السيارة بالذات — متناسقة، مقتصدة، لا تخطئها العين كأيقونة منتصف القرن — أصبحت النجم القطبي البصري لمشروع آيكونيك.",
        },
      },
      {
        type: "image",
        src: binz1950,
        alt: {
          en: "The 1950s Mercedes-Benz wagon by Binz that inspired the project",
          ru: "Универсал Mercedes-Benz от Binz 1950-х — источник вдохновения",
          ar: "ستيشن مرسيدس-بنز من Binz في الخمسينيات الذي ألهم المشروع",
        },
      },
      {
        type: "heading",
        text: {
          en: "Built on the AMG G63",
          ru: "Построен на базе AMG G63",
          ar: "مبني على أساس AMG G63",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Underneath the new bodywork sits the modern AMG G63 — its drivetrain, chassis and electronics untouched. Everything visible is new: a fully redesigned aero kit, sculpted wide arches, rear diffuser, custom forged wheels and a bespoke spare-wheel cover that doubles as the project's signature.",
          ru: "Под новым кузовом — современный AMG G63: трансмиссия, шасси и электроника остались без изменений. Всё, что снаружи, переделано заново: полный аэродинамический обвес, расширенные арки, задний диффузор, кованые диски на заказ и фирменный кожух запаски — главный росчерк проекта.",
          ar: "تحت الهيكل الجديد يقع طراز AMG G63 الحديث — مجموعة نقل الحركة والشاسيه والإلكترونيات دون تغيير. كل ما هو ظاهر جديد: مجموعة ديناميكية هوائية معاد تصميمها بالكامل، أقواس عريضة منحوتة، ناشر خلفي، عجلات مصبوبة حسب الطلب، وغطاء عجلة احتياطية مخصص يعمل كتوقيع المشروع.",
        },
      },
      {
        type: "image",
        src: amgBase,
        alt: {
          en: "Rear three-quarter — based on the AMG G63",
          ru: "Задние три четверти — база AMG G63",
          ar: "منظر الربع الخلفي — على قاعدة AMG G63",
        },
      },
      {
        type: "heading",
        text: {
          en: "A Retro Grille and a New Silhouette",
          ru: "Ретро-решётка и новая линия силуэта",
          ar: "شبكة كلاسيكية وصورة ظلية جديدة",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "The defining gesture is the front: an oversized, vertically-slatted radiator grille drawn directly from the 1950s reference, paired with a softly rounded bonnet that breaks fifty years of G-Class orthodoxy. The aerodynamic body kit is both decorative and functional — channelling air around the new arches without disturbing the upright stance the G is loved for.",
          ru: "Главный жест — спереди: крупная вертикальная решётка радиатора, взятая прямо из референса 1950-х, в паре с мягко закруглённым капотом, который ломает полвека ортодоксальности G-Class. Аэродинамический обвес одновременно декоративный и функциональный — направляет потоки вокруг новых арок, не разрушая вертикальную осанку, за которую любят G.",
          ar: "اللفتة الحاسمة في المقدمة: شبكة رادياتير كبيرة بقضبان عمودية مستوحاة مباشرة من مرجع الخمسينيات، مقترنة بغطاء محرك مدوّر بنعومة يكسر خمسين عاماً من تقاليد فئة G. مجموعة الهيكل الأيروديناميكية زخرفية ووظيفية في آن واحد — توجه الهواء حول الأقواس الجديدة دون الإخلال بالوضعية المنتصبة التي تُحب فئة G لأجلها.",
        },
      },
      {
        type: "image",
        src: grilleRetro,
        alt: {
          en: "The retro-styled radiator grille — the project's signature",
          ru: "Решётка радиатора в ретро-стиле — фирменный элемент",
          ar: "شبكة الرادياتير على الطراز الكلاسيكي — التوقيع المميز",
        },
      },
      {
        type: "image",
        src: aero,
        alt: {
          en: "Rounded bonnet and full aerodynamic body kit",
          ru: "Закруглённый капот и полный аэродинамический обвес",
          ar: "غطاء محرك مدوّر ومجموعة هوائية كاملة",
        },
      },
      {
        type: "quote",
        text: {
          en: "We were not chasing nostalgia. We were chasing the discipline that built those cars — and bringing it forward into the next G-Class.",
          ru: "Мы не гнались за ностальгией. Мы гнались за дисциплиной, которая строила те машины — и переносили её в следующий G-Class.",
          ar: "لم نكن نسعى وراء الحنين. كنا نسعى وراء الانضباط الذي بنى تلك السيارات — ونقله إلى فئة G التالية.",
        },
        author: "Alexey Gashkov, Founder · MetaGarage",
      },
      {
        type: "heading",
        text: {
          en: "Fifty Cars. From $700,000.",
          ru: "Пятьдесят машин. От $700 000.",
          ar: "خمسون سيارة. ابتداءً من 700,000 دولار.",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Production is capped at fifty examples worldwide. Each car is built to order in the Dubai workshop, and pricing starts from USD 700,000 — climbing with the depth of personalisation: bespoke leathers, marquetry, embroidery, paint and one-off interior architecture.",
          ru: "Тираж ограничен пятьюдесятью экземплярами на весь мир. Каждая машина собирается под заказ в мастерской в Дубае, цена стартует от $700 000 и растёт вместе с глубиной персонализации: эксклюзивные кожи, маркетри, вышивка, окраска и индивидуальная архитектура салона.",
          ar: "الإنتاج محدود بخمسين نسخة عالمياً. تُبنى كل سيارة حسب الطلب في ورشة دبي، ويبدأ السعر من 700,000 دولار أمريكي — ويرتفع مع عمق التخصيص: جلود حصرية، تطعيمات، تطريز، دهان، وهندسة داخلية فريدة.",
        },
      },
      {
        type: "image",
        src: fiftyUnits,
        alt: {
          en: "Top view — limited to fifty units",
          ru: "Вид сверху — лимит в пятьдесят экземпляров",
          ar: "منظر علوي — محدود بخمسين نسخة",
        },
      },
      {
        type: "image",
        src: price,
        alt: {
          en: "Side profile — pricing from USD 700,000",
          ru: "Боковая проекция — цена от $700 000",
          ar: "المنظر الجانبي — السعر من 700,000 دولار",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "The Iconic is divisive by design. It is meant to be. For those who see it for what it is — a serious piece of coachbuilding that quietly references one of the most graceful Mercedes ever made — commissions are open now.",
          ru: "Iconic поляризует по задумке. Так и должно быть. Для тех, кто видит его таким, какой он есть — серьёзная кузовная работа, тихо цитирующая один из самых грациозных Mercedes в истории — приём заказов уже открыт.",
          ar: "آيكونيك مثيرة للجدل بتصميمها. ومن المفترض أن تكون كذلك. لمن يراها على حقيقتها — قطعة جادة من فن بناء الهياكل تستشهد بهدوء بإحدى أكثر سيارات مرسيدس أناقة على الإطلاق — الطلبات مفتوحة الآن.",
        },
      },
    ],
  },
];

export const getAllNews = (): NewsItem[] =>
  [...NEWS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

export const getNewsBySlug = (slug: string): NewsItem | undefined =>
  NEWS.find((n) => n.slug === slug);

export const getRelatedNews = (slug: string, n = 2): NewsItem[] =>
  getAllNews().filter((x) => x.slug !== slug).slice(0, n);
