import heroMain from "@/assets/hero-main-new.webp";
import g900Front from "@/assets/g900-white-front-new.webp";
import g900Aerial from "@/assets/g900-white-aerial-new.webp";
import g900Side from "@/assets/g900-white-side-new.webp";
import g63Front from "@/assets/g63-front-new.webp";
import g63Side from "@/assets/g63-side-new.webp";
import g63Aerial from "@/assets/g63-aerial.webp";
import commissionHero from "@/assets/commission-hero-final.webp";

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
  eventDate?: string; // ISO (for events)
  location?: string;
}

export const NEWS: NewsItem[] = [
  {
    slug: "g900-black-edition-unveiled",
    category: "news",
    publishedAt: "2026-04-22",
    cover: g900Front,
    gallery: [g900Front, g900Aerial, g900Side],
    title: {
      en: "G900 Black Edition: A New Chapter for the Atelier",
      ru: "G900 Black Edition: новая глава ателье",
      ar: "جي 900 الإصدار الأسود: فصل جديد للأتيليه",
    },
    excerpt: {
      en: "Our flagship G-Class transformation enters a new era — a stealth silhouette built around forged carbon and obsidian leather.",
      ru: "Наша флагманская трансформация G-Class открывает новую эру — стелс-силуэт из кованого карбона и кожи обсидиан.",
      ar: "تدخل تحويلتنا الرائدة لفئة G حقبة جديدة — صورة ظلية متخفية مبنية على كربون مطروق وجلد سبج.",
    },
    author: "M-Monogram Atelier",
    content: [
      {
        type: "paragraph",
        text: {
          en: "After eighteen months of development, the G900 Black Edition makes its debut — a complete re-imagination of the silhouette in matte obsidian, forged carbon and brushed titanium.",
          ru: "Спустя восемнадцать месяцев разработки G900 Black Edition выходит в свет — полное переосмысление силуэта в матовом обсидиане, кованом карбоне и шлифованном титане.",
          ar: "بعد ثمانية عشر شهراً من التطوير، تظهر G900 الإصدار الأسود لأول مرة — إعادة تصور كاملة للصورة الظلية بالسبج المطفأ والكربون المطروق والتيتانيوم المصقول.",
        },
      },
      {
        type: "heading",
        text: {
          en: "Stealth, Refined",
          ru: "Стелс, доведённый до совершенства",
          ar: "تخفّي مصقول",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Every panel was re-engineered in-house. The body kit is hand-laid forged carbon, finished with a 7-stage matte ceramic — a depth that absorbs light rather than reflects it.",
          ru: "Каждая панель переосмыслена внутри ателье. Обвес — вручную уложенный кованый карбон с семиступенчатой матовой керамикой, поглощающей свет, а не отражающей его.",
          ar: "تم إعادة هندسة كل لوحة داخلياً. مجموعة الهيكل مصنوعة يدوياً من الكربون المطروق، مع طلاء سيراميك مطفأ من سبع مراحل — عمق يمتص الضوء بدلاً من عكسه.",
        },
      },
      {
        type: "image",
        src: g900Aerial,
      },
      {
        type: "quote",
        text: {
          en: "We did not want a darker car. We wanted a quieter one.",
          ru: "Нам не нужна была более тёмная машина. Нам нужна была более тихая.",
          ar: "لم نكن نريد سيارة أغمق. أردنا سيارة أكثر هدوءاً.",
        },
        author: "Lead Designer, M-Monogram",
      },
      {
        type: "paragraph",
        text: {
          en: "The Black Edition will be limited to twelve commissions worldwide. First deliveries begin Q3 2026.",
          ru: "Black Edition будет ограничен двенадцатью заказами по всему миру. Первые поставки — Q3 2026.",
          ar: "سيقتصر الإصدار الأسود على اثنتي عشرة طلبية عالمياً. تبدأ التسليمات الأولى في الربع الثالث من 2026.",
        },
      },
    ],
  },
  {
    slug: "dubai-private-preview-2026",
    category: "event",
    publishedAt: "2026-03-15",
    eventDate: "2026-06-12",
    location: "Meta Garage, Al Quoz, Dubai",
    cover: commissionHero,
    gallery: [commissionHero, heroMain],
    title: {
      en: "Private Preview · Dubai 2026",
      ru: "Закрытый предпоказ · Дубай 2026",
      ar: "عرض خاص · دبي 2026",
    },
    excerpt: {
      en: "An invitation-only evening at Meta Garage to preview the next four flagship commissions before public reveal.",
      ru: "Вечер по приглашениям в Meta Garage с предпоказом четырёх флагманских проектов до их публичного релиза.",
      ar: "أمسية بدعوة خاصة في ميتا غاراج لاستعراض الطلبيات الرائدة الأربع التالية قبل الكشف العلني.",
    },
    content: [
      {
        type: "paragraph",
        text: {
          en: "On June 12, 2026, the atelier will open its doors to a private circle of clients, partners and press for an evening dedicated to the work of the past year.",
          ru: "12 июня 2026 года ателье откроет двери для закрытого круга клиентов, партнёров и прессы — вечер, посвящённый работе ушедшего года.",
          ar: "في 12 يونيو 2026، سيفتح الأتيليه أبوابه لدائرة خاصة من العملاء والشركاء والصحافة لأمسية مكرسة لأعمال العام الماضي.",
        },
      },
      {
        type: "heading",
        text: {
          en: "What to Expect",
          ru: "Чего ожидать",
          ar: "ما يمكن توقعه",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Four unreleased commissions, a guided tour of the workshop, and a conversation with the design team. Limited to 60 guests.",
          ru: "Четыре нереализованных проекта, экскурсия по мастерской и беседа с командой дизайна. Не более 60 гостей.",
          ar: "أربع طلبيات لم تُكشف بعد، جولة موجهة في الورشة، وحوار مع فريق التصميم. يقتصر العدد على 60 ضيفاً.",
        },
      },
      {
        type: "image",
        src: heroMain,
      },
      {
        type: "paragraph",
        text: {
          en: "RSVP is strictly by invitation. To request access, contact the atelier directly.",
          ru: "Регистрация — только по приглашениям. Для запроса доступа свяжитесь с ателье напрямую.",
          ar: "التأكيد بالحضور حصراً بالدعوة. لطلب الوصول، يرجى التواصل مع الأتيليه مباشرة.",
        },
      },
    ],
  },
  {
    slug: "robb-report-feature",
    category: "press",
    publishedAt: "2026-02-04",
    cover: g63Front,
    gallery: [g63Front, g63Side, g63Aerial],
    title: {
      en: "Featured in Robb Report Middle East",
      ru: "Публикация в Robb Report Middle East",
      ar: "ميزة في روب ريبورت الشرق الأوسط",
    },
    excerpt: {
      en: "Robb Report Middle East spotlights the atelier in a six-page feature on the new generation of bespoke automotive houses.",
      ru: "Robb Report Middle East посвятил ателье шестистраничный материал о новом поколении домов индивидуального автомобилестроения.",
      ar: "تسلط روب ريبورت الشرق الأوسط الضوء على الأتيليه في تقرير من ست صفحات حول الجيل الجديد من بيوت السيارات المصممة حسب الطلب.",
    },
    content: [
      {
        type: "paragraph",
        text: {
          en: "The February issue of Robb Report Middle East features a six-page profile of the atelier, with original photography of the G63 Black commission.",
          ru: "Февральский номер Robb Report Middle East включает шестистраничный профиль ателье с оригинальной фотосъёмкой проекта G63 Black.",
          ar: "يتضمن عدد فبراير من روب ريبورت الشرق الأوسط ملفاً تعريفياً من ست صفحات عن الأتيليه، مع تصوير حصري لطلبية جي 63 السوداء.",
        },
      },
      {
        type: "quote",
        text: {
          en: "A house where the discipline of haute horlogerie meets the geometry of the road.",
          ru: "Дом, где дисциплина высокого часового искусства встречается с геометрией дороги.",
          ar: "بيت يلتقي فيه انضباط الساعات الراقية بهندسة الطريق.",
        },
        author: "Robb Report Middle East",
      },
      {
        type: "image",
        src: g63Side,
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
