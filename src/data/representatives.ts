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
    description: "Flagship atelier and global headquarters.",
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
    id: "monaco",
    name: "M-Monogram Monaco",
    city: "Monaco",
    country: "Monaco",
    region: "Europe",
    coordinates: [7.4246, 43.7384],
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
