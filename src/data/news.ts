import cover from "@/assets/news/m-monogram-g-iconic/01-cover.jpeg";
import iksAerial from "@/assets/news/iksanov-review/01-aerial.webp";
import iksSide from "@/assets/news/iksanov-review/02-side.webp";
import iksRear from "@/assets/news/iksanov-review/03-rear.webp";
import iksFront from "@/assets/news/iksanov-review/04-front-driving.webp";
import frontGrille from "@/assets/news/m-monogram-g-iconic/02-front-grille.jpeg";
import binz1950 from "@/assets/news/m-monogram-g-iconic/03-binz-1950.jpeg";
import amgBase from "@/assets/news/m-monogram-g-iconic/04-amg-base.jpeg";
import grilleRetro from "@/assets/news/m-monogram-g-iconic/05-grille-retro.jpeg";
import aero from "@/assets/news/m-monogram-g-iconic/06-aero.jpeg";
import fiftyUnits from "@/assets/news/m-monogram-g-iconic/07-50-units.jpeg";
import price from "@/assets/news/m-monogram-g-iconic/08-price.jpeg";
import frontBlack from "@/assets/news/m-monogram-g-iconic/09-front-black.jpeg";
import dtFront from "@/assets/news/dubai-tuner-700k/01-front.webp";
import dtAerial from "@/assets/news/dubai-tuner-700k/02-aerial.webp";
import dtSide from "@/assets/news/dubai-tuner-700k/03-side.webp";
import dtWheel from "@/assets/news/dubai-tuner-700k/04-wheel.webp";
import dtEmblem from "@/assets/news/dubai-tuner-700k/05-emblem.webp";

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
    slug: "was-g63-became-m-monogram-iconic",
    category: "press",
    publishedAt: "2026-05-04",
    cover: iksFront,
    gallery: [iksFront, iksAerial, iksSide, iksRear],
    author: "Манас Иксанов",
    location: "Dubai, UAE",
    title: {
      en: "It Was a G63 — Now It Is the M Monogram G 3.0 Iconic",
      ru: "Был G63 — стал M Monogram G 3.0 Iconic",
      ar: "كان جي 63 — والآن هو إم مونوغرام جي 3.0 آيكونيك",
    },
    excerpt: {
      en: "A Dubai atelier reshapes the G-Class face in Mercedes' newest signature style — and the result is genuinely shocking.",
      ru: "Дубайское ателье преобразило облик G-класса в новейшем фирменном стиле автопроизводителя — и результат шокирует.",
      ar: "أتيليه في دبي يعيد تشكيل وجه فئة G بأحدث الأسلوب المميز لمرسيدس — والنتيجة صادمة فعلاً.",
    },
    content: [
      {
        type: "paragraph",
        text: {
          en: "The G-Wagen was originally built as a military vehicle, and went into production with a utilitarian face and a simplified radiator panel that had nothing in common with the chrome grilles of the brand's civilian models. Even so, attempts to dress it up — to make it look richer, more pompous — have been made many times, and almost certainly will keep coming.",
          ru: "«Гелендваген», изначально создававшийся как армейская модель, в производство пошёл с утилитарным передком и упрощённой облицовкой радиатора, которая в корне отличалась от «гриля» гражданских моделей той же марки. И всё же попытки украсить внедорожник, сделать его облик дороже и помпезнее предпринимались неоднократно и вряд ли прекратятся в обозримом будущем.",
          ar: "صُممت جي-فاغن أصلاً كمركبة عسكرية، ودخلت الإنتاج بواجهة نفعية وشبكة رادياتير مبسطة لا علاقة لها بشبكات الكروم في الموديلات المدنية للعلامة. ومع ذلك، جرت محاولات عديدة لتزيينها — لجعلها تبدو أغنى وأكثر فخامة — ومن المؤكد أنها ستستمر.",
        },
      },
      {
        type: "image",
        src: iksAerial,
        alt: {
          en: "Top-down view of the M Monogram G 3.0 Iconic",
          ru: "Вид сверху на M Monogram G 3.0 Iconic",
          ar: "منظر علوي لإم مونوغرام جي 3.0 آيكونيك",
        },
      },
      {
        type: "heading",
        text: {
          en: "Mercedes' New Signature Look",
          ru: "Новый фирменный стиль Mercedes",
          ar: "المظهر المميز الجديد لمرسيدس",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "As is well known, Mercedes-Benz is gradually rolling out a large, chrome-rich radiator grille across a whole range of new cars — the electric C-Class and VLE are typical examples. Yet there is no public talk of redesigning the G-Class in this same direction.",
          ru: "Как известно, сейчас в Mercedes-Benz потихоньку внедряют крупную радиаторную решётку с обилием хрома на целый ряд своих новинок. В качестве примера можно привести электрические С-класс и VLE. Тем не менее о том, чтобы переоформить в таком стиле ещё и G-класс, речь пока не идёт.",
          ar: "كما هو معلوم، تطرح مرسيدس-بنز تدريجياً شبكة رادياتير كبيرة غنية بالكروم على مجموعة كاملة من سياراتها الجديدة — كفئة C الكهربائية و VLE. ومع ذلك لا يوجد حديث علني عن إعادة تصميم فئة G بنفس الاتجاه.",
        },
      },
      {
        type: "image",
        src: iksFront,
        alt: {
          en: "The new front: oversized chrome grille and triangular star fog lamps",
          ru: "Новый передок: огромная хромированная решётка и звёздочки противотуманок",
          ar: "الواجهة الجديدة: شبكة كروم كبيرة ومصابيح ضباب على شكل نجوم",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "But where Mercedes-Benz has not yet thought about such a transformation, Dubai has done it for them. The local atelier MetaGarage — founded by an entrepreneur from Russia — has built the M Monogram G 3.0 Iconic: a G63 crowned with a vast, glittering radiator grille and triangular star-shaped fog lamps. The designers do not name the current Mercedes design language as their inspiration. Instead they cite a little-known seven-decade-old wagon built by Binz on the chassis of the 300C saloon.",
          ru: "Но если в Mercedes-Benz о таком преображении ещё не думают, то за них новый облик гелика создали в Дубае, где организованное выходцем из России тюнинг-ателье MetaGarage построило M Monogram G 3.0 Iconic. Это G63, увенчанный огромной блестящей радиаторной решёткой и звёздочками противотуманок. При этом текущие веяния в мерседесовском дизайне в качестве источника вдохновения не указаны, вместо них дизайнеры упоминают малоизвестный универсал 70-летней давности, сделанный мастерами Binz на шасси седана 300С.",
          ar: "لكن حيث لم تفكر مرسيدس-بنز بعد في مثل هذا التحول، قامت دبي بذلك نيابةً عنها. فقد بنى الأتيليه المحلي ميتاغاراج — الذي أسسه رجل أعمال من روسيا — طراز إم مونوغرام جي 3.0 آيكونيك: جي 63 متوج بشبكة رادياتير ضخمة ولامعة ومصابيح ضباب مثلثة على شكل نجوم. لا يذكر المصممون لغة تصميم مرسيدس الحالية كمصدر إلهامهم، بل يشيرون إلى ستيشن قليل الشهرة عمره سبعة عقود صنعه ماهرو Binz على شاسيه سيدان 300C.",
        },
      },
      {
        type: "image",
        src: iksSide,
        alt: {
          en: "Side profile — the silhouette of the donor G63 remains, the language has changed",
          ru: "Боковая проекция — силуэт донорского G63 сохранён, язык дизайна изменён",
          ar: "المنظر الجانبي — تبقى صورة G63 الأصلية، لكن لغة التصميم تغيرت",
        },
      },
      {
        type: "heading",
        text: {
          en: "One Car Today, Up to Fifty",
          ru: "Сегодня — одна машина, в перспективе до пятидесяти",
          ar: "سيارة واحدة اليوم، حتى خمسين",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Whether MetaGarage limited the work to a new exterior, or also touched the cabin and the powertrain, has not been disclosed. For now the car exists as a single example. But MetaGarage is open to building more for clients who want one — the plan calls for up to fifty units, with prices starting at USD 700,000.",
          ru: "Ограничились ли тюнеры из MetaGarage созданием нового внешнего облика для внедорожника или поработали и над салоном с силовой установкой тоже, не уточняется. Более того, пока этот автомобиль существует в единственном экземпляре, но желающим заполучить аналогичный G-Class в MetaGarage рады пойти навстречу. В планах ателье значится постройка до 50 подобных машин с ценой от 700 тыс. долларов США.",
          ar: "لم يُكشف ما إذا كان ميتاغاراج اقتصر على المظهر الخارجي الجديد أم أنه عمل على المقصورة ومجموعة نقل الحركة أيضاً. حالياً، توجد السيارة كنموذج فردي. لكن ميتاغاراج مستعد لبناء المزيد للعملاء الراغبين — تتضمن الخطة بناء ما يصل إلى خمسين وحدة، بأسعار تبدأ من 700,000 دولار أمريكي.",
        },
      },
      {
        type: "image",
        src: iksRear,
        alt: {
          en: "Rear view — chrome strip, monogram spare-wheel cover and signature script",
          ru: "Вид сзади — хромированная полоса, монограмма на кожухе запаски и фирменная подпись",
          ar: "المنظر الخلفي — شريط كروم، مونوغرام على غطاء العجلة الاحتياطية وتوقيع مميز",
        },
      },
    ],
  },
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
  {
    slug: "dubai-tuner-700k-g-class-face-mercedes-only-sketched",
    category: "press",
    publishedAt: "2026-05-10",
    cover: dtFront,
    gallery: [dtFront, dtAerial, dtSide, dtWheel, dtEmblem],
    author: "Carscoops",
    location: "Dubai, UAE",
    title: {
      en: "Dubai Tuner's $700,000 G-Class Wears A Face Mercedes Only Dared To Sketch",
      ru: "Дубайский тюнер за $700 000 надел на G-Class лицо, которое Mercedes только осмелился набросать",
      ar: "تيونر دبي بقيمة 700 ألف دولار يضع على فئة G وجهاً لم يجرؤ مرسيدس إلا على رسمه",
    },
    excerpt: {
      en: "M Monogram G 3.0 Iconic is based on the AMG G63 and inspired by a classic one-off Mercedes wagon.",
      ru: "M Monogram G 3.0 Iconic построен на базе AMG G63 и вдохновлён уникальным универсалом Mercedes из 1950-х.",
      ar: "إم مونوغرام جي 3.0 آيكونيك مبنية على AMG G63 ومستوحاة من سيارة مرسيدس فريدة كلاسيكية.",
    },
    content: [
      {
        type: "paragraph",
        text: {
          en: "Middle-East-based MetaGarage has revealed its latest G-Class project. The M Monogram G 3.0 Iconic draws inspiration from a 1950s Binz Benz one-off, with mods that include a huge grille and matching curved hood, plus star-design DRLs.",
          ru: "Базирующееся на Ближнем Востоке ателье MetaGarage представило свой новейший проект на базе G-Class. M Monogram G 3.0 Iconic вдохновлён уникальным Binz Benz 1950-х годов: огромная решётка радиатора, скруглённый капот в её стиль и DRL в форме звезды.",
          ar: "كشفت ميتاغراج التي تتخذ من الشرق الأوسط مقراً عن أحدث مشاريعها على فئة G. إم مونوغرام جي 3.0 آيكونيك مستوحاة من بنز بنز فريدة من الخمسينيات، مع شبكة ضخمة وغطاء محرك منحنٍ مطابق، وأضواء نهارية على شكل نجمة.",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "In the \"nothing succeeds like excess\" car landscape of Dubai, where luxury cars are everywhere and even Mansory-style modifications aren't uncommon, it takes something truly extraordinary to stand out. MetaGarage has done it — and it might even have given Mercedes some ideas in the process.",
          ru: "В дубайском автомобильном ландшафте, где «избыток — лучший рецепт успеха», где роскошные машины повсюду, а доработки в стиле Mansory никого не удивляют, чтобы выделиться, нужно что-то по-настоящему экстраординарное. MetaGarage это удалось — и, возможно, попутно подкинул идею самому Mercedes.",
          ar: "في مشهد سيارات دبي حيث \"لا شيء ينجح كالإفراط\"، وحيث السيارات الفاخرة في كل مكان وتعديلات على طراز مانسوري ليست غريبة، يتطلب التميز شيئاً استثنائياً حقاً. ميتاغراج فعلتها — وربما أعطت مرسيدس بعض الأفكار في العملية.",
        },
      },
      {
        type: "image",
        src: dtAerial,
        alt: {
          en: "Top-down view of the M Monogram G 3.0 Iconic",
          ru: "Вид сверху на M Monogram G 3.0 Iconic",
          ar: "منظر علوي لإم مونوغرام جي 3.0 آيكونيك",
        },
      },
      {
        type: "heading",
        text: {
          en: "A Face That Rewrites the G-Class",
          ru: "Лицо, переписывающее G-Class",
          ar: "وجه يعيد كتابة فئة G",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "We've seen plenty of modified G-Class SUVs before, but what really sets the M Monogram G 3.0 Iconic apart is its humongous retro grille. As wide as it is tall, the grille dominates the G's nose and completely changes the entire face of the otherwise boxy utility.",
          ru: "Мы видели множество доработанных G-Class, но M Monogram G 3.0 Iconic выделяет колоссальная ретро-решётка. Такая же широкая, как и высокая, она доминирует над передком и полностью меняет лицо в остальном угловатого внедорожника.",
          ar: "رأينا الكثير من سيارات فئة G المعدّلة، لكن ما يميز إم مونوغرام جي 3.0 آيكونيك حقاً هو شبكتها الضخمة بطراز ريترو. عريضة بقدر ما هي عالية، تهيمن الشبكة على مقدمة جي وتغير وجه السيارة بالكامل.",
        },
      },
      {
        type: "image",
        src: dtSide,
        alt: {
          en: "Side profile of the M Monogram G 3.0 Iconic",
          ru: "Боковая проекция M Monogram G 3.0 Iconic",
          ar: "المنظر الجانبي لإم مونوغرام جي 3.0 آيكونيك",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "MetaGarage founder, Russian Alexey Gashkov, says the G 3.0 Iconic is inspired by a one-off coachbuilt wagon from the 1950s — crafted from a Mercedes 300 C by Binz for a wealthy American client. But it's also hard not to be reminded of the Vision Iconic coupe concept Mercedes revealed in 2025.",
          ru: "Основатель MetaGarage, россиянин Алексей Гашков, говорит, что G 3.0 Iconic вдохновлён уникальным кузовным универсалом 1950-х — сделанным ателье Binz на базе Mercedes 300 C для богатого американского клиента. При этом трудно не вспомнить и концепт-купе Vision Iconic, показанный Mercedes в 2025-м.",
          ar: "يقول مؤسس ميتاغراج، الروسي أليكسي غاشكوف، إن جي 3.0 آيكونيك مستوحاة من واغن مصنوع يدوياً من الخمسينيات — صنعته بنز من مرسيدس 300 C لعميل أمريكي ثري. لكن من الصعب أيضاً ألا يذكّر بمفهوم كوبيه فيجن آيكونيك الذي كشفت عنه مرسيدس عام 2025.",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Tear yourself away from staring at that schnozzle and you might just notice the star-shaped DRLs lifted from Mercedes' latest passenger cars, the sci-fi-looking lower bumper and industrial-style side skirts.",
          ru: "Отвлекитесь от созерцания этого «носа» — и заметите DRL в форме звезды, позаимствованные у новейших легковых Mercedes, sci-fi-нижний бампер и индустриального вида пороги.",
          ar: "ابتعد عن التحديق في تلك المقدمة وقد تلاحظ الأضواء النهارية على شكل نجمة المأخوذة من أحدث سيارات مرسيدس، والمصد السفلي ذي المظهر الخيال العلمي وعتبات جانبية بطراز صناعي.",
        },
      },
      {
        type: "heading",
        text: {
          en: "Is That a Maybach Badge?",
          ru: "Это что, шильдик Maybach?",
          ar: "هل هذا شعار مايباخ؟",
        },
      },
      {
        type: "image",
        src: dtEmblem,
        alt: {
          en: "M Monogram emblem",
          ru: "Эмблема M Monogram",
          ar: "شعار إم مونوغرام",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "Chrome strips finish off the bottom of the front and rear bumpers, there are MetaGarage M Monogram badges — whose similarity to Maybach's logo might raise eyebrows in Stuttgart — and the whole lot rides on fat six-spoke wheels.",
          ru: "Хромированные полосы завершают низ переднего и заднего бамперов, на кузове красуются шильдики MetaGarage M Monogram — их сходство с логотипом Maybach наверняка поднимет брови в Штутгарте — а вся эта картина опирается на массивные шестиспицевые диски.",
          ar: "تنتهي شرائط الكروم من أسفل المصدّين الأمامي والخلفي، وهناك شعارات إم مونوغرام من ميتاغراج — التي قد يثير تشابهها مع شعار مايباخ الدهشة في شتوتغارت — وكل ذلك يقف على عجلات ضخمة بستة أذرع.",
        },
      },
      {
        type: "image",
        src: dtWheel,
        alt: {
          en: "Six-spoke forged wheel detail",
          ru: "Деталь кованого шестиспицевого диска",
          ar: "تفاصيل العجلة المطروقة بستة أذرع",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "There are pictures of a couple of different Iconics on MetaGarage's socials. One is plain black, allowing the huge chrome grille to take center stage. The other, dressed in black over white and with a black grille, is even more arresting as an overall package — though its black grille is (marginally) less shouty.",
          ru: "В соцсетях MetaGarage есть фотографии нескольких Iconic. Один — полностью чёрный, что выводит на первый план огромную хромированную решётку. Другой — в чёрно-белой ливрее с чёрной решёткой — выглядит как пакет ещё эффектнее, хотя его чёрный «гриль» (чуть-чуть) сдержаннее.",
          ar: "هناك صور لعدة طرازات آيكونيك مختلفة على حسابات ميتاغراج. واحدة سوداء بالكامل، مما يسمح للشبكة الكرومية الضخمة بأخذ المسرح. والأخرى بطلاء أسود فوق أبيض وشبكة سوداء، أكثر جاذبية كحزمة كاملة — رغم أن شبكتها السوداء أقل صخباً (بقليل).",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "The company says it's willing to build 50 examples of the restraint-free G-wagons, with prices starting at $700,000 — though we don't doubt that some buyers' personalization requests will send the total soaring.",
          ru: "Компания готова построить 50 экземпляров этих лишённых сдержанности «гелендвагенов», цены стартуют от $700 000 — но мы не сомневаемся, что персонализация некоторых заказчиков отправит итоговую цифру в космос.",
          ar: "تقول الشركة إنها مستعدة لبناء 50 نسخة من هذه الجي-واغن الخالية من القيود، بأسعار تبدأ من 700,000 دولار — لكننا لا نشك في أن طلبات التخصيص لبعض المشترين سترفع المجموع إلى أرقام أعلى بكثير.",
        },
      },
      {
        type: "quote",
        text: {
          en: "Do you think Mercedes ought to integrate its massive new grilles into factory-built G-Class models, or are curves a crime when it comes to the G?",
          ru: "Должен ли Mercedes интегрировать свои массивные новые решётки в заводские G-Class, или плавные линии — преступление, когда речь о «Гелике»?",
          ar: "هل تعتقد أن مرسيدس يجب أن تدمج شبكاتها الجديدة الضخمة في طرازات فئة G من المصنع، أم أن المنحنيات جريمة عندما يتعلق الأمر بجي؟",
        },
        author: "Carscoops",
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
