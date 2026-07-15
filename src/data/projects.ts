// G3.0 M Monogram ICONIC – Gold Edition images
import g3GoldFront from "@/assets/g3-iconic-gold-front.jpg";
import g3GoldSide from "@/assets/g3-iconic-gold-side.jpg";
import g3GoldRear from "@/assets/g3-iconic-gold-rear.jpg";
import g3GoldDetail from "@/assets/g3-iconic-gold-detail.jpg";
import g3GoldWindow from "@/assets/g3-iconic-gold-window.jpg";
import g3GoldWheel from "@/assets/g3-iconic-gold-wheel.jpg";
import g3GoldInterior from "@/assets/g3-iconic-gold-interior.jpg";
import g3GoldRearSeats from "@/assets/g3-iconic-gold-rearseats.jpg";
import g3GoldCabin from "@/assets/g3-iconic-gold-cabin.jpg";
import g3GoldDash from "@/assets/g3-iconic-gold-dash.jpg";

import fusion01 from "@/assets/fusion/01-front-3q.jpg.asset.json";
import fusion02 from "@/assets/fusion/02-front-side.jpg.asset.json";
import fusion03 from "@/assets/fusion/03-front-passenger.jpg.asset.json";
import fusion04 from "@/assets/fusion/04-side.jpg.asset.json";
import fusion05 from "@/assets/fusion/05-rear-top.jpg.asset.json";
import fusion06 from "@/assets/fusion/06-rear-3q.jpg.asset.json";
import fusion07 from "@/assets/fusion/07-rear.jpg.asset.json";
import fusion08 from "@/assets/fusion/08-top.jpg.asset.json";
import fusion09 from "@/assets/fusion/09-interior-top.jpg.asset.json";

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
    id: "g3-iconic",
    title: "G3.0 M Monogram ICONIC",
    subtitle: "Gold Edition",
    year: "2024",
    duration: "12 weeks",
    package: "Ultra-Limited",
    category: "G-Class",
    coverImage: g3GoldFront,
    images: [
      { src: g3GoldFront, title: "Front view" },
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
    description: "An ultra-limited luxury transformation of the G-Class, created in three exclusive editions — Gold, Silver and Black. Each edition features a distinctive M Monogram exterior identity, bespoke details and a commanding collector-level presence. Gold Edition: a bold black-and-gold statement for those who choose visibility, power and ultimate luxury. Silver Edition: a refined monochrome interpretation with a sharper, colder and more futuristic character. Black Edition: a pure dark signature edition — discreet, aggressive and uncompromising.",
    modifications: [
      "M Monogram exterior identity package",
      "24K gold-accented forged wheels",
      "Custom Maybach grille with gold mesh",
      "Bespoke two-tone leather cabin (black / cognac)",
      "M Monogram signature dashboard inlay",
      "Three exclusive editions: Gold, Silver, Black",
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
    id: "rolls-royce-fusion",
    title: "The Fusion",
    subtitle: "Bespoke Edition",
    year: "2024",
    duration: "12 weeks",
    package: "Full",
    category: "Bespoke Concept",
    coverImage: fusionCover,
    images: [
      { src: fusionCover, title: "Fusion hero" },
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
