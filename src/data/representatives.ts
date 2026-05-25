export interface RepresentativeSocials {
  instagram?: string;
  whatsapp?: string;
  telegram?: string;
  website?: string;
}

export interface Representative {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  coordinates: [number, number];
  timezone?: string;
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

export const getRepresentativeTimezone = (rep: Representative) =>
  rep.timezone ?? "Europe/Zurich";

export const getRepresentativeSocials = (rep: Representative): RepresentativeSocials => ({
  ...DEFAULT_SOCIALS,
  ...(rep.socials ?? {}),
});

export const representatives: Representative[] = [
  {
    id: "switzerland-hungary",
    name: "M-Monogram Switzerland & Hungary",
    city: "Zurich",
    country: "Switzerland",
    region: "Switzerland / Hungary",
    coordinates: [8.5417, 47.3769],
    timezone: "Europe/Zurich",
    description: "Official representative covering Switzerland and Hungary.",
    services: ["Exterior", "Interior", "Forged Wheels"],
  },
  {
    id: "germany",
    name: "M-Monogram Germany",
    city: "Munich",
    country: "Germany",
    region: "Germany",
    coordinates: [11.5820, 48.1351],
    timezone: "Europe/Berlin",
    description: "Official representative for Germany.",
    services: ["Exterior", "Interior", "Forged Wheels"],
  },
  {
    id: "france-monaco",
    name: "M-Monogram France & Monaco",
    city: "Nice",
    country: "France",
    region: "France / Monaco / French Riviera",
    coordinates: [7.2620, 43.7102],
    timezone: "Europe/Paris",
    description: "Official representative covering France, Monaco and the French Riviera.",
    services: ["Exterior", "Interior", "Forged Wheels"],
  },
];

export const getRepresentativeById = (id: string) =>
  representatives.find((r) => r.id === id);
