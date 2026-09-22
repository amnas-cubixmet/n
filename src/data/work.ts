export interface WorkProject {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  desktopColumn: string;
}

export const workProjects: WorkProject[] = [
  {
    id: 1,
    slug: "brand-identity-system",
    title: "NORTHFRAME IDENTITY",
    category: "BRAND IDENTITY",
    image: "/images/work/work-01-branding.jpg",
    alt: "NORTHFRAME Brand Identity System",
    desktopColumn: "lg:col-span-4 lg:col-start-8",
  },
  {
    id: 2,
    slug: "digital-marketing-campaign",
    title: "EDITORIAL CAMPAIGNS",
    category: "DIGITAL MARKETING",
    image: "/images/work/work-02-digital-marketing.jpg",
    alt: "NORTHFRAME Digital Marketing Showcase",
    desktopColumn: "lg:col-span-4 lg:col-start-1",
  },
  {
    id: 3,
    slug: "creative-production-suite",
    title: "CREATIVE PRODUCTION",
    category: "CREATIVE PRODUCTION",
    image: "/images/work/work-03-creative-production.jpg",
    alt: "NORTHFRAME Creative Production Suite",
    desktopColumn: "lg:col-span-4 lg:col-start-7",
  },
];
