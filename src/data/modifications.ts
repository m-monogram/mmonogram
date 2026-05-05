// Exterior images
import exteriorPainting from "@/assets/mods/exterior-painting.jpg";
import exterior6 from "@/assets/mods/exterior-6.jpg";
import exteriorHeroPurple from "@/assets/mods/exterior-hero-purple.jpg";
import exterior1 from "@/assets/mods/exterior-1.jpg";
import exterior2 from "@/assets/mods/exterior-2.jpg";
import exterior3 from "@/assets/mods/exterior-3.jpg";
import exterior4 from "@/assets/mods/exterior-4.jpg";

// Interior images
import interior1 from "@/assets/mods/interior-1.jpg";
import interior2 from "@/assets/mods/interior-2.jpg";
import interior3 from "@/assets/mods/interior-3.jpg";
import interior4 from "@/assets/mods/interior-4.jpg";
import interiorHero from "@/assets/mods/interior-hero.jpg";

// Wheels images
import wheels5 from "@/assets/mods/wheels-5.jpg";
import wheels6 from "@/assets/mods/wheels-6.jpg";

import { Paintbrush, Car, Cog, LucideIcon } from "lucide-react";

export interface ModificationImage {
  src: string;
  title: string;
  description: string;
}

export interface ModificationService {
  name: string;
  description: string;
  price: string;
}

export interface ContentBlock {
  type: "text" | "highlight" | "quote";
  contentKey: string;
  content?: string;
  position?: "left" | "right" | "center" | "full";
}

export interface ModificationCategory {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  coverImage: string;
  images: ModificationImage[];
  description: string;
  contentBlocks?: ContentBlock[];
  services: ModificationService[];
  materials: string[];
  duration: string;
  warranty: string;
}

// Base modification categories data (without localized text)
const modificationCategoriesBase = [
  {
    id: "exterior",
    icon: Paintbrush,
    coverImage: exterior1,
    images: [
      { src: exterior1, title: "M Monogram Body Kit", description: "Complete exterior transformation with bespoke body panels and components" },
      { src: exterior2, title: "Custom Widebody Concept", description: "Exploded view of custom widebody conversion for G-Class" },
      { src: exterior3, title: "Precision Craftsmanship", description: "Hand-fitted carbon fiber hood installation by certified specialists" },
      { src: exterior4, title: "Luxury SUV Conversion", description: "Full exterior redesign with custom front fascia and aero package" },
    ],
    services: [
      { name: "Custom Paint", description: "Exclusive color formulations, matte, satin, or gloss finishes", price: "from €5,000" },
      { name: "Body Kits", description: "Brabus, Mansory, and custom widebody conversions", price: "from €15,000" },
      { name: "Carbon Fiber Elements", description: "Hood, roof, mirror caps, side skirts, and more", price: "from €3,000" },
      { name: "PPF Full Body", description: "Complete paint protection with self-healing film", price: "from €4,500" },
    ],
    materials: ["BASF Glasurit Paint", "3M Scotchprint", "Hexis Carbon Fiber", "XPEL Ultimate Plus PPF", "Oracal Premium Vinyl"],
    duration: "2-6 weeks",
    warranty: "5 years on paint, 10 years on PPF",
  },
  {
    id: "interior",
    icon: Car,
    coverImage: interiorHero,
    images: [
      { src: interior3, title: "Premium G-Class Interior", description: "Bespoke leather and carbon fiber craftsmanship" },
      { src: interior4, title: "Luxury Rear Cabin", description: "Starlight ceiling with executive seating and premium leather" },
      { src: interior1, title: "Racing Seats", description: "Custom Alcantara sport seats with contrast stitching" },
      { src: interior2, title: "Cockpit View", description: "Full interior transformation with premium materials" },
    ],
    contentBlocks: [
      { type: "text", contentKey: "modifications.interiorBlock3", position: "full" },
      { type: "quote", contentKey: "modifications.interiorBlock4", position: "full" },
      { type: "text", contentKey: "modifications.interiorBlock5", position: "full" },
    ],
    services: [
      { name: "Full Leather Retrim", description: "Complete interior in Nappa, Alcantara, or exotic leather", price: "from €12,000" },
      { name: "Starlight Ceiling", description: "Custom fiber optic headliner with shooting stars", price: "from €4,500" },
      { name: "Carbon Fiber Trim", description: "Dashboard, console, and door panel carbon overlay", price: "from €6,000" },
      { name: "Ambient Lighting", description: "64-color ambient lighting system upgrade", price: "from €2,500" },
    ],
    materials: ["Italian Nappa Leather", "German Alcantara", "Toray Carbon Fiber", "Swarovski Crystals", "Piano Black Lacquer"],
    duration: "3-8 weeks",
    warranty: "3 years on materials and workmanship",
  },
  {
    id: "wheels",
    icon: Cog,
    coverImage: wheels5,
    images: [
      { src: wheels5, title: "GL.3", description: "Premium 23-inch glossy black forged wheels" },
      { src: wheels6, title: "DC.8", description: "22-inch diamond cut two-tone finish" },
    ],
    contentBlocks: [
      { type: "text", contentKey: "modifications.wheelsBlock1", position: "left" },
      { type: "text", contentKey: "modifications.wheelsBlock2", position: "right" },
      { type: "quote", contentKey: "modifications.wheelsBlock3", position: "full" },
      { type: "text", contentKey: "modifications.wheelsBlock4", position: "left" },
      { type: "text", contentKey: "modifications.wheelsBlock5", position: "right" },
      { type: "quote", contentKey: "modifications.wheelsBlock6", position: "full" },
    ],
    services: [
      { name: "Custom Forged Wheels", description: "Bespoke design, any size from 20\" to 24\"", price: "from €8,000" },
      { name: "Performance Brakes", description: "Carbon ceramic or big brake kit upgrade", price: "from €12,000" },
      { name: "Custom Finish", description: "Powder coat, chrome, or custom color matching", price: "from €1,500" },
      { name: "Colored Calipers", description: "High-temp paint in any color with custom logo", price: "from €800" },
    ],
    materials: ["6061-T6 Forged Aluminum", "T1000 Carbon Fiber", "Titanium Hardware", "Ceramic Coating", "Premium Rubber Compound"],
    duration: "4-8 weeks for custom orders",
    warranty: "Lifetime structural warranty",
  },
];

// Localization mapping for category fields
const categoryLocalization: Record<string, { titleKey: string; subtitleKey: string; descriptionKey: string }> = {
  exterior: { titleKey: 'modifications.exterior', subtitleKey: 'modifications.exteriorSubtitle', descriptionKey: 'modifications.exteriorDesc' },
  interior: { titleKey: 'modifications.interior', subtitleKey: 'modifications.interiorSubtitle', descriptionKey: 'modifications.interiorDesc' },
  wheels: { titleKey: 'modifications.wheels', subtitleKey: 'modifications.wheelsSubtitle', descriptionKey: 'modifications.wheelsDesc' },
};

/**
 * Get localized modification categories
 * @param t - Translation function from useLanguage hook
 */
export function getLocalizedModificationCategories(t: (key: string) => string): ModificationCategory[] {
  return modificationCategoriesBase.map((category) => {
    const localization = categoryLocalization[category.id];

    // Локализация content blocks
    const localizedContentBlocks = category.contentBlocks?.map(block => ({
      ...block,
      content: t(block.contentKey),
    }));

    return {
      ...category,
      title: localization ? t(localization.titleKey) : category.id,
      subtitle: localization ? t(localization.subtitleKey) : '',
      description: localization ? t(localization.descriptionKey) : '',
      contentBlocks: localizedContentBlocks,
    } as ModificationCategory;
  });
}

// Default export for backward compatibility (English fallback)
export const modificationCategories: ModificationCategory[] = modificationCategoriesBase.map((category) => {
  const defaultTexts: Record<string, { title: string; subtitle: string; description: string }> = {
    exterior: {
      title: "Exterior",
      subtitle: "Body & Paint Customization",
      description: "Transform your vehicle's appearance with our premium exterior modifications. From custom paint finishes to aggressive body kits, we create unique looks that turn heads and make statements."
    },
    interior: {
      title: "Interior",
      subtitle: "Luxury Cabin Transformation",
      description: "We create bespoke automotive interiors. Each interior is individually designed to complement the vehicle's architecture and identity."
    },
    wheels: {
      title: "Forged Wheels",
      subtitle: "Premium Wheel Solutions",
      description: "We design and install custom forged wheels at a premium level. Our collection features exclusive designs developed for individual projects."
    },
  };
  return {
    ...category,
    title: defaultTexts[category.id]?.title || category.id,
    subtitle: defaultTexts[category.id]?.subtitle || '',
    description: defaultTexts[category.id]?.description || '',
  } as ModificationCategory;
});
