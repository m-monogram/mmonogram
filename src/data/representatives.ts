export interface RepresentativeSocials {
  instagram?: string;
  whatsapp?: string; // E.164 phone for wa.me
  telegram?: string; // username without @
  website?: string;
}

export interface Representative {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  timezone?: string; // IANA tz e.g. "Asia/Dubai"
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  description?: string;
  image?: string;
  flagship?: boolean;
  established?: number;
  services?: string[];
  socials?: RepresentativeSocials;
}

export const DEFAULT_SOCIALS: RepresentativeSocials = {
  instagram: "https://www.instagram.com/metagarage_m_monogram/?igsh=MTBtejVmOGdzYW5jMQ%3D%3D",
  whatsapp: "971545077707",
};

const TZ_BY_REGION: Record<string, string> = {
  "Middle East": "Asia/Dubai",
  Europe: "Europe/London",
  "North America": "America/Los_Angeles",
  Asia: "Asia/Tokyo",
};

export const getRepresentativeTimezone = (rep: Representative) =>
  rep.timezone ?? TZ_BY_REGION[rep.region] ?? "UTC";

export const getRepresentativeSocials = (rep: Representative): RepresentativeSocials => ({
  ...DEFAULT_SOCIALS,
  ...(rep.socials ?? {}),
});

// Placeholder data — exact addresses will be provided later.
// Coordinates use [longitude, latitude] order for react-simple-maps.
export const representatives: Representative[] = [
  {
    id: "dubai-uae",
    name: "M-Monogram Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    coordinates: [55.2708, 25.2048],
    timezone: "Asia/Dubai",
    flagship: true,
    established: 2018,
    address: "Al Quoz Industrial Area 3, Dubai, UAE",
    phone: "+971 54 507 7707",
    email: "info@mmonogram.com",
    hours: "Mon — Sat · 09:00 — 19:00",
    description: "Flagship atelier and global headquarters.",
    services: ["Exterior", "Interior", "Forged Wheels", "Performance"],
    socials: {
      instagram: "https://www.instagram.com/metagarage_m_monogram/?igsh=MTBtejVmOGdzYW5jMQ%3D%3D",
      whatsapp: "971545077707",
    },
  },
  {
    id: "riyadh-ksa",
    name: "M-Monogram Riyadh",
    city: "Riyadh",
    country: "Saudi Arabia",
    region: "Middle East",
    coordinates: [46.6753, 24.7136],
  },
  {
    id: "doha-qa",
    name: "M-Monogram Doha",
    city: "Doha",
    country: "Qatar",
    region: "Middle East",
    coordinates: [51.5310, 25.2854],
  },
  {
    id: "london-uk",
    name: "M-Monogram London",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    coordinates: [-0.1276, 51.5074],
  },
  {
    id: "moscow-ru",
    name: "M-Monogram Moscow",
    city: "Moscow",
    country: "Russia",
    region: "Europe",
    coordinates: [37.6173, 55.7558],
  },
  {
    id: "switzerland-hungary",
    name: "M-Monogram Switzerland & Hungary",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
    coordinates: [8.5417, 47.3769],
    description: "Regional representative covering Switzerland and Hungary.",
    services: ["Exterior", "Interior", "Forged Wheels"],
  },
  {
    id: "germany",
    name: "M-Monogram Germany",
    city: "Munich",
    country: "Germany",
    region: "Europe",
    coordinates: [11.5820, 48.1351],
    description: "Official representative for Germany.",
    services: ["Exterior", "Interior", "Forged Wheels"],
  },
  {
    id: "france-monaco",
    name: "M-Monogram France & Monaco",
    city: "Nice",
    country: "France",
    region: "Europe",
    coordinates: [7.2620, 43.7102],
    description: "Regional representative covering France, Monaco and the French Riviera.",
    services: ["Exterior", "Interior", "Forged Wheels"],
  },
  {
    id: "los-angeles-us",
    name: "M-Monogram Los Angeles",
    city: "Los Angeles",
    country: "United States",
    region: "North America",
    coordinates: [-118.2437, 34.0522],
  },
  {
    id: "miami-us",
    name: "M-Monogram Miami",
    city: "Miami",
    country: "United States",
    region: "North America",
    coordinates: [-80.1918, 25.7617],
  },
  {
    id: "shanghai-cn",
    name: "M-Monogram Shanghai",
    city: "Shanghai",
    country: "China",
    region: "Asia",
    coordinates: [121.4737, 31.2304],
  },
  {
    id: "tokyo-jp",
    name: "M-Monogram Tokyo",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
    coordinates: [139.6917, 35.6895],
  },
  {
    id: "singapore",
    name: "M-Monogram Singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
    coordinates: [103.8198, 1.3521],
  },
];

export const getRepresentativeById = (id: string) =>
  representatives.find((r) => r.id === id);
