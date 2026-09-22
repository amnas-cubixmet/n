export type OrganicShapeVariant = "asymmetric-blob" | "pebble-triangle" | "shallow-dip" | "tall-oval";

export interface Project {
  id: string;
  title: string;
  discipline: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  shapeVariant: OrganicShapeVariant;
  destination?: string;
  objectPosition?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "aethel-brand-identity",
    title: "Aethel Luxury Atelier",
    discipline: "Brand Identity & Packaging",
    image: "/images/work/work-01-branding.jpg",
    imageAlt: "Aethel luxury skincare packaging display",
    featured: true,
    shapeVariant: "asymmetric-blob",
    objectPosition: "center 40%",
  },
  {
    id: "horizon-digital-platform",
    title: "Horizon Analytics Engine",
    discipline: "Digital Experience & UI/UX",
    image: "/images/work/work-02-digital-marketing.jpg",
    imageAlt: "Horizon analytics dashboard on dark background",
    featured: true,
    shapeVariant: "pebble-triangle",
    objectPosition: "center center",
  },
  {
    id: "solaris-creative-campaign",
    title: "Solaris Architectural Series",
    discipline: "Creative Production & Film",
    image: "/images/work/work-03-creative-production.jpg",
    imageAlt: "Minimalist modern architecture photo production",
    featured: true,
    shapeVariant: "shallow-dip",
    objectPosition: "center 30%",
  },
  {
    id: "nexus-tech-ecosystem",
    title: "Nexus Quantum Systems",
    discipline: "Technology & Interface Design",
    image: "/images/work/work-04-technology.jpg",
    imageAlt: "Nexus dark mode quantum data interface design",
    featured: true,
    shapeVariant: "tall-oval",
    objectPosition: "center center",
  },
];
