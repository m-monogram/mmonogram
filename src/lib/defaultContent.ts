/**
 * Default content for all site sections.
 * Used as fallback when Supabase data is unavailable.
 */
export const defaultContent: Record<string, Record<string, unknown>> = {
  hero: {
    buttonBookProject: "Book a Project",
    buttonDiscover: "Discover Collection",
  },
  mission: {
    heading: "OUR MISSION",
    headingLine2: "GOES BEYOND TUNING",
    subtitle: "Luxury car modification and customization services in the UAE🇦🇪",
  },
  about: {
    values: ["Craftsmanship", "Innovation", "Excellence"],
  },
  contact: {
    phone: "+971 54 507 7707",
    whatsapp: "971545077707",
    email: "m_monogram@mail.ru",
    address: "Dubai, UAE, Al Quoz Industrial Area 3",
    workHours: "Mon-Sat: 9AM - 7PM",
    landline: "+971 4 228 4177",
  },
  brand: {
    heroVideo: "/videos/brand-hero-video.mp4",
    coreValues: ["Exclusivity", "Precision", "Innovation"],
  },
  footer: {
    socialLinks: [
      { platform: "instagram", url: "https://www.instagram.com/metagarage_m_monogram/", label: "M-Monogram" },
      { platform: "instagram", url: "https://www.instagram.com/1metagarage/", label: "MetaGarage" },
      { platform: "youtube", url: "https://www.youtube.com/@alex_meta", label: "YouTube" },
    ],
  },
  vin_banner: {
    phones: ["+971 54 507 7707", "+971 4 228 4177"],
  },
};

/**
 * Section metadata for admin panel
 */
export const sectionMeta: Record<string, { name: string; description: string; fields: FieldMeta[] }> = {
  hero: {
    name: "Hero Section",
    description: "Главный баннер на главной странице",
    fields: [
      { key: "buttonBookProject", type: "text", label: "Кнопка 'Забронировать'" },
      { key: "buttonDiscover", type: "text", label: "Кнопка 'Коллекция'" },
    ],
  },
  mission: {
    name: "Mission Statement",
    description: "Блок миссии после Hero секции",
    fields: [
      { key: "heading", type: "text", label: "Заголовок (строка 1)" },
      { key: "headingLine2", type: "text", label: "Заголовок (строка 2)" },
      { key: "subtitle", type: "textarea", label: "Подзаголовок" },
    ],
  },
  about: {
    name: "About Us",
    description: "Секция 'О нас'",
    fields: [
      { key: "values", type: "array", label: "Ценности" },
    ],
  },
  contact: {
    name: "Контактная информация",
    description: "Телефоны, email, адрес",
    fields: [
      { key: "phone", type: "text", label: "Основной телефон" },
      { key: "whatsapp", type: "text", label: "WhatsApp номер" },
      { key: "email", type: "text", label: "Email" },
      { key: "address", type: "text", label: "Адрес" },
      { key: "workHours", type: "text", label: "Часы работы" },
      { key: "landline", type: "text", label: "Городской телефон" },
    ],
  },
  brand: {
    name: "Brand Page",
    description: "Страница бренда",
    fields: [
      { key: "heroVideo", type: "text", label: "URL видео" },
      { key: "coreValues", type: "array", label: "Основные ценности" },
    ],
  },
  footer: {
    name: "Footer",
    description: "Подвал сайта",
    fields: [
      { key: "socialLinks", type: "json", label: "Социальные сети (JSON)" },
    ],
  },
  vin_banner: {
    name: "VIN Баннер",
    description: "Баннер верификации VIN",
    fields: [
      { key: "phones", type: "array", label: "Телефоны" },
    ],
  },
};

export interface FieldMeta {
  key: string;
  type: 'text' | 'textarea' | 'image' | 'array' | 'boolean' | 'json';
  label: string;
}
