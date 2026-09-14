export interface ProjectMeta {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  tag: string;
  title: string;
  summary: string;
  image: string;
  overview: string[];
  meta: ProjectMeta[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'huts-haven',
    tag: 'Web Design · Concept',
    title: 'Huts Haven',
    summary:
      'A nature-inspired website concept blending immersive imagery with a clean, modern experience.',
    image: 'images/huts-haven.jpg',
    overview: [
      'Huts Haven is a concept site for a small collection of off-grid cabin stays. The brief called for a design that felt calm and unhurried — letting the imagery of the huts and their surroundings carry most of the story, with type and layout staying out of the way.',
      'Large, full-bleed photography sets the tone on arrival, while a simple, restrained type system keeps booking details, amenities, and location information easy to scan. The result is a site that feels more like a quiet retreat than a booking engine.',
    ],
    meta: [
      { label: 'Category', value: 'Web Design · Concept' },
      { label: 'Focus', value: 'Imagery, Layout, Typography' },
      { label: 'Tools', value: 'Figma, HTML/CSS' },
    ],
  },
  {
    slug: 'comptech',
    tag: 'Web Design · Concept',
    title: 'CompTech',
    summary:
      'A smart-technology brand site built around bold type and a confident, futuristic tone.',
    image: 'images/comptech.jpg',
    overview: [
      'CompTech is a concept brand site for a smart-technology company, built to feel confident and a little futuristic without tipping into gimmick territory. Bold, oversized type carries the headlines, while dark, high-contrast sections give product imagery room to stand out.',
      'The layout leans on clear sections for services, product highlights, and a direct call to action — keeping the experience easy to follow even as the visual tone stays loud and technical.',
    ],
    meta: [
      { label: 'Category', value: 'Web Design · Concept' },
      { label: 'Focus', value: 'Typography, Brand Tone, Layout' },
      { label: 'Tools', value: 'Figma, HTML/CSS' },
    ],
  },
  {
    slug: 'gps-drone',
    tag: 'Web Design · Concept',
    title: 'GPS Drone',
    summary:
      'A product landing page for a foldable, stable, and smooth-flying drone concept.',
    image: 'images/gps-drone.jpg',
    overview: [
      'GPS Drone is a concept landing page for a foldable consumer drone, built to sell the product on its specs and flight feel without burying either in clutter. Feature callouts sit directly on top of product shots, so battery life, stability, and camera quality are visible at a glance.',
      'The layout follows a straightforward top-to-bottom story — hero shot, key features, then a closer look at the folded and unfolded form factor — built to work as a single scrollable page rather than a maze of sections.',
    ],
    meta: [
      { label: 'Category', value: 'Web Design · Concept' },
      { label: 'Focus', value: 'Product Storytelling, Layout' },
      { label: 'Tools', value: 'Figma, HTML/CSS' },
    ],
  },
];

export function getProjectBySlug(slug: string | null): Project {
  return PROJECTS.find((project) => project.slug === slug) ?? PROJECTS[0];
}

export function getNextProject(current: Project): Project {
  const index = PROJECTS.indexOf(current);
  return PROJECTS[(index + 1) % PROJECTS.length];
}
