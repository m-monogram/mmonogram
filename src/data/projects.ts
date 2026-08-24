// G3.0 M Monogram ICONIC – edition covers
import g3Black from "@/assets/g-1.jpg";
import g3BlackAlt from "@/assets/g-2.jpg";
import g3GoldCover from "@/assets/g-3.jpg";
import g3GoldFront from "@/assets/g3-iconic-gold-front.jpg";
import greyCover from "@/assets/g3-grey-cover.jpg";
import greyStudio from "@/assets/g3-grey-studio.jpg";
import greyRear from "@/assets/g3-grey-rear.jpg";
import greyDetail from "@/assets/g3-grey-detail.jpg";
import greyOverhead from "@/assets/g3-grey-overhead.jpg";
import g3GoldSide from "@/assets/g3-iconic-gold-side.jpg";
import g3GoldRear from "@/assets/g3-iconic-gold-rear.jpg";
import g3GoldDetail from "@/assets/g3-iconic-gold-detail.jpg";
import g3GoldWindow from "@/assets/g3-iconic-gold-window.jpg";
import g3GoldWheel from "@/assets/g3-iconic-gold-wheel.jpg";
import g3GoldInterior from "@/assets/g3-iconic-gold-interior.jpg";
import g3GoldRearSeats from "@/assets/g3-iconic-gold-rearseats.jpg";
import g3GoldCabin from "@/assets/g3-iconic-gold-cabin.jpg";
import g3GoldDash from "@/assets/g3-iconic-gold-dash.jpg";

import fusionCover from "@/assets/fusion/cover.jpg";
import fusion01 from "@/assets/fusion/01-front-3q.jpg";
import fusion02 from "@/assets/fusion/02-front-side.jpg";
import fusion03 from "@/assets/fusion/03-front-passenger.jpg";
import fusion04 from "@/assets/fusion/04-side.jpg";
import fusion05 from "@/assets/fusion/05-rear-top.jpg";
import fusion06 from "@/assets/fusion/06-rear-3q.jpg";
import fusion07 from "@/assets/fusion/07-rear.jpg";
import fusion08 from "@/assets/fusion/08-top.jpg";
import fusion09 from "@/assets/fusion/09-interior-top.jpg";

// Original Fusion archive photos
import img6694 from "@/assets/IMG_6694.webp";
import img6695 from "@/assets/IMG_6695.webp";
import img6696 from "@/assets/IMG_6696.webp";
import img6697 from "@/assets/IMG_6697.webp";
import img6698 from "@/assets/IMG_6698.webp";
import img6699 from "@/assets/IMG_6699.webp";
import img6700 from "@/assets/IMG_6700.webp";
import img6701 from "@/assets/IMG_6701.webp";
import img6702 from "@/assets/IMG_6702.webp";
import img6703 from "@/assets/IMG_6703.webp";
import img6704 from "@/assets/IMG_6704.webp";
import img6705 from "@/assets/IMG_6705.webp";
import img6706 from "@/assets/IMG_6706.webp";
import img6707 from "@/assets/IMG_6707.webp";
import img6708 from "@/assets/IMG_6708.webp";

export interface ProjectSpecs {
  exterior: string;
  interior: string;
  carbon: string;
  spoilers: string;
  wheels: string;
  aeroKit: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  duration: string;
  package: string;
  category: string;
  coverImage: string;
  images: { src: string; title: string }[];
  description: string;
  modifications: string[];
  specs: ProjectSpecs;
  videoUrl?: string;
  isHub?: boolean;
  editionOf?: string;
}

export const GWAGEN_HUB_ID = "g3-iconic";

export const GWAGEN_EDITION_ORDER = [
  "g3-iconic-black",
  "g3-iconic-gold",
  "g3-iconic-grey",
] as const;

export function projectKey(project: { id: string; slug?: string }) {
  return project.slug ?? project.id;
}

export function isGWagenHubId(id: string) {
  return id === GWAGEN_HUB_ID;
}

export function isGWagenEditionId(id: string) {
  return (GWAGEN_EDITION_ORDER as readonly string[]).includes(id);
}

export function getGWagenEditionsFrom<T extends { id: string; slug?: string }>(projects: T[]): T[] {
  const map = new Map(projects.map((p) => [projectKey(p), p]));
  return GWAGEN_EDITION_ORDER.map((id) => map.get(id)).filter((p): p is T => Boolean(p));
}

export function getListingProjects<T extends { id: string; slug?: string; editionOf?: string }>(
  projects: T[]
): T[] {
  return projects.filter((p) => !isGWagenEditionId(projectKey(p)) && !p.editionOf);
}

export const projects: Project[] = [
  {
    id: "g3-iconic",
    title: "G3.0 M Monogram ICONIC",
    subtitle: "G-Class",
    year: "2024",
    duration: "12 weeks",
    package: "Ultra-Limited",
    category: "G-Class",
    coverImage: g3Black,
    isHub: true,
    images: [{ src: g3Black, title: "Black edition" }],
    description: "An ultra-limited G-Class transformation in three exclusive editions — Black, Gold and Grey.",
    modifications: [
      "M Monogram exterior identity package",
      "Three exclusive editions: Black, Gold, Grey",
    ],
    specs: {
      exterior: "Three exclusive finishes",
      interior: "Bespoke Nappa cabin",
      carbon: "Carbon detailing",
      spoilers: "Integrated roof spoiler",
      wheels: "24'' Forged M Monogram",
      aeroKit: "M Monogram ICONIC bodykit",
    },
  },
  {
    id: "g3-iconic-black",
    editionOf: "g3-iconic",
    title: "M Monogram Black",
    subtitle: "ICONIC",
    year: "2024",
    duration: "12 weeks",
    package: "Ultra-Limited",
    category: "G-Class",
    coverImage: g3Black,
    images: [
      { src: g3Black, title: "Front three-quarter" },
      { src: g3BlackAlt, title: "Stealth front view" },
      { src: greyStudio, title: "Studio high angle" },
      { src: greyRear, title: "Rear three-quarter" },
    ],
    description: "Black Edition — a pure dark signature. Discreet, aggressive and uncompromising, with a commanding collector-level presence.",
    modifications: [
      "M Monogram exterior identity package",
      "Gloss black body with chrome grille",
      "Illuminated star air intakes",
      "24'' forged turbine wheels",
    ],
    specs: {
      exterior: "Obsidian Black",
      interior: "Black Nappa",
      carbon: "Gloss black carbon",
      spoilers: "Integrated roof spoiler",
      wheels: "24'' Forged chrome turbine",
      aeroKit: "M Monogram ICONIC bodykit",
    },
  },
  {
    id: "g3-iconic-gold",
    editionOf: "g3-iconic",
    title: "M Monogram Gold",
    subtitle: "ICONIC",
    year: "2024",
    duration: "12 weeks",
    package: "Ultra-Limited",
    category: "G-Class",
    coverImage: g3GoldFront,
    images: [
      { src: g3GoldFront, title: "Front view" },
      { src: g3GoldCover, title: "Gold grille three-quarter" },
      { src: g3GoldSide, title: "Side profile" },
      { src: g3GoldRear, title: "Rear view" },
      { src: g3GoldDetail, title: "Hood & wheel detail" },
      { src: g3GoldWindow, title: "Cabin through window" },
      { src: g3GoldWheel, title: "Forged wheel" },
      { src: g3GoldInterior, title: "Cockpit" },
      { src: g3GoldDash, title: "Dashboard signature" },
      { src: g3GoldCabin, title: "Rear cabin & door detail" },
      { src: g3GoldRearSeats, title: "Rear seats" },
    ],
    description: "Gold Edition — a bold black-and-gold statement for those who choose visibility, power and ultimate luxury.",
    modifications: [
      "M Monogram exterior identity package",
      "24K gold-accented forged wheels",
      "Custom Maybach grille with gold mesh",
      "Bespoke two-tone leather cabin (black / cognac)",
      "M Monogram signature dashboard inlay",
    ],
    specs: {
      exterior: "Obsidian Black with gold trim",
      interior: "Black & Cognac Nappa, gold accents",
      carbon: "Gloss black carbon detailing",
      spoilers: "Integrated roof spoiler",
      wheels: "24'' Forged M Monogram, gold center",
      aeroKit: "M Monogram ICONIC bodykit",
    },
  },
  {
    id: "g3-iconic-grey",
    editionOf: "g3-iconic",
    title: "M Monogram Grey",
    subtitle: "ICONIC",
    year: "2024",
    duration: "12 weeks",
    package: "Ultra-Limited",
    category: "G-Class",
    coverImage: greyCover,
    images: [
      { src: greyCover, title: "Front three-quarter" },
      { src: greyStudio, title: "Studio high angle" },
      { src: greyRear, title: "Rear three-quarter" },
      { src: greyDetail, title: "Front detail" },
      { src: greyOverhead, title: "Overhead front" },
    ],
    description: "Grey Edition — a refined monochrome interpretation with a sharper, colder and more futuristic character.",
    modifications: [
      "M Monogram exterior identity package",
      "Maybach-style chrome grille",
      "Satin-dark body with silver trim",
      "24'' forged chrome wheels",
    ],
    specs: {
      exterior: "Graphite Grey / chrome",
      interior: "Black Nappa, silver accents",
      carbon: "Dark carbon detailing",
      spoilers: "Integrated roof spoiler",
      wheels: "24'' Forged chrome",
      aeroKit: "M Monogram ICONIC bodykit",
    },
  },

  {
    id: "rolls-royce-fusion",
    title: "The Fusion",
    subtitle: "Bespoke Edition",
    year: "2024",
    duration: "12 weeks",
    package: "Full",
    category: "Bespoke Concept",
    coverImage: fusionCover,
    images: [
      { src: fusionCover, title: "Front three-quarter" },
      { src: fusion01, title: "Front three-quarter alt" },
      { src: fusion02, title: "Front side profile" },
      { src: fusion03, title: "Front passenger side" },
      { src: fusion04, title: "Side profile" },
      { src: fusion05, title: "Rear top view" },
      { src: fusion06, title: "Rear three-quarter" },
      { src: fusion07, title: "Rear view" },
      { src: fusion08, title: "Top view" },
      { src: fusion09, title: "Interior overhead" },
      // Colour studies — Crimson
      { src: img6708, title: "Crimson — front three-quarter" },
      { src: img6694, title: "Crimson — side profile" },
      { src: img6700, title: "Crimson — rear three-quarter" },
      // Colour studies — Bronze
      { src: img6701, title: "Bronze — front three-quarter" },
      { src: img6698, title: "Bronze — overhead" },
      { src: img6699, title: "Bronze — rear three-quarter" },
      // Colour studies — Azure
      { src: img6697, title: "Azure — front three-quarter" },
      { src: img6705, title: "Azure — side profile" },
      { src: img6695, title: "Azure — rear overhead" },
      // Colour studies — Arctic White
      { src: img6696, title: "Arctic White — overhead" },
      { src: img6706, title: "Arctic White — overhead alt" },
      // Colour studies — Amethyst
      { src: img6703, title: "Amethyst — side profile" },
      { src: img6704, title: "Amethyst — overhead" },
      // Interiors
      { src: img6702, title: "Cabin — blue leather" },
      { src: img6707, title: "Cabin — tan leather" },

    ],
    description: "The Fusion is a modern luxury statement, blending timeless elegance with bold contemporary design. Featuring bespoke exterior elements, a sculpted grille, and a handcrafted open-top interior. A seamless fusion of power, refinement, and future vision.",
    modifications: [
      "Bespoke exterior design elements",
      "Sculpted signature grille",
      "Handcrafted open-top interior",
      "Custom Navy Blue metallic finish",
      "Exclusive white leather interior",
      "22'' forged wheels with dark finish",
    ],
    specs: {
      exterior: "Navy Blue Metallic Bespoke",
      interior: "Arctic White handcrafted leather",
      carbon: "Carbon fiber hood accents",
      spoilers: "Integrated rear diffuser",
      wheels: "22'' Forged dark finish",
      aeroKit: "Custom open-top conversion",
    },
  },
];
