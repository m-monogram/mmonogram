// G63 Black Edition images
import g63Front from "@/assets/g63-front-new.webp";
import g63Quarter from "@/assets/g63-quarter-new.webp";
import g63Side from "@/assets/g63-side-new.webp";
import g63Rear from "@/assets/g63-rear-new.webp";

// G900 White Pearl Edition images
import g900Front from "@/assets/g900-white-front-new.webp";
import g900Aerial from "@/assets/g900-white-aerial-new.webp";
import g900Side from "@/assets/g900-white-side-new.webp";
import g900Rear from "@/assets/g900-white-rear-new.webp";
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
}

export const projects: Project[] = [
  {
    id: "g900-maybach",
    title: "G900 M Monogram",
    subtitle: "White Pearl Edition",
    year: "2024",
    duration: "10 weeks",
    package: "Full",
    category: "G63",
    coverImage: g900Front,
    images: [
      { src: g900Front, title: "Front view" },
      { src: g900Aerial, title: "Aerial view" },
      { src: g900Side, title: "Side profile" },
      { src: g900Rear, title: "Rear view" },
    ],
    description: "This M-Monogram G900 is a signature project defined by precision and architectural design. Custom M-Monogram grille, proprietary monogram detailing, and exclusive forged wheels form a clear and recognizable identity. Created as a statement of control, individuality, and modern luxury.",
    modifications: [
      "Custom Maybach front grille conversion",
      "Exclusive monogram pattern wrap on hood & roof",
      "24'' Multi-spoke forged wheels",
      "Carbon fiber roof spoiler",
      "Brabus exhaust system G900",
      "Full body PPF protection",
    ],
    specs: {
      exterior: "White Pearl Metallic with PPF",
      interior: "Maybach exclusive leather",
      carbon: "Carbon roof & hood accents",
      spoilers: "Carbon fiber roof spoiler",
      wheels: "24'' Maybach forged multi-spoke",
      aeroKit: "Maybach widebody conversion",
    },
  },
  {
    id: "g63-signature",
    title: "G900 M Monogram",
    subtitle: "FULL Black Edition",
    year: "2024",
    duration: "8 weeks",
    package: "Full",
    category: "G63",
    coverImage: g63Front,
    images: [
      { src: g63Front, title: "Front view" },
      { src: g63Quarter, title: "Quarter view" },
      { src: g63Side, title: "Side profile" },
      { src: g63Rear, title: "Rear view" },
    ],
    description: "This M-Monogram G900 is a signature project defined by precision and architectural design. Custom M-Monogram grille, proprietary monogram detailing, and exclusive forged wheels form a clear and recognizable identity. Created as a statement of control, individuality, and modern luxury.",
    modifications: [
      "Brabus Widestar carbon body kit",
      "23'' forged wheels with exclusive design",
      "Full interior retrim in Nappa leather",
      "Stage 2 chip tuning (+150 HP)",
      "Akrapovič exhaust system",
      "PPF protection film on entire body",
    ],
    specs: {
      exterior: "Obsidian Black Metallic with PPF",
      interior: "Nappa Leather Cognac/Black",
      carbon: "Full Brabus carbon package",
      spoilers: "Carbon rear spoiler",
      wheels: "23'' Forged Monoblock",
      aeroKit: "Brabus Widestar widebody",
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
    coverImage: img6694,
    images: [
      { src: img6694, title: "Fusion view 1" },
      { src: img6695, title: "Fusion view 2" },
      { src: img6696, title: "Fusion view 3" },
      { src: img6697, title: "Fusion view 4" },
      { src: img6698, title: "Fusion view 5" },
      { src: img6699, title: "Fusion view 6" },
      { src: img6700, title: "Fusion view 7" },
      { src: img6701, title: "Fusion view 8" },
      { src: img6702, title: "Fusion view 9" },
      { src: img6703, title: "Fusion view 10" },
      { src: img6704, title: "Fusion view 11" },
      { src: img6705, title: "Fusion view 12" },
      { src: img6706, title: "Fusion view 13" },
      { src: img6707, title: "Fusion view 14" },
      { src: img6708, title: "Fusion view 15" },
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
