import { Component } from '@angular/core';

export interface ClientProject {
  title: string;
  category: string;
  image: string;
  url: string;
}

export interface FeaturedProject {
  title: string;
  meta: string;
  description: string;
  image: string;
  url: string;
}

/**
 * "Selected Client & Agency Work" — full-width section highlighting the
 * author's work with Notable Design Co., a large featured case-study
 * card for Notable itself, and a grid of the client projects delivered
 * through the agency.
 */
@Component({
  selector: 'app-portfolio-work',
  standalone: true,
  imports: [],
  templateUrl: './portfolio-work.component.html',
  styleUrl: './portfolio-work.component.scss',
})
export class PortfolioWorkComponent {
  eyebrow = 'Selected Client & Agency Work';

  heading =
    'Designing and building websites across brands, industries, and platforms.';

  intro =
    "For the past 1.5+ years, I've worked with Notable Design Co. as a UI/UX & WordPress Developer, helping turn ideas, strategy, and design direction into polished, responsive websites.";

  supportingText =
    "My work spans Notable's own website and client projects, including UI/UX implementation, responsive development, custom interactions, site updates, QA, and ongoing improvements.";

  skills: string[] = [
    'UI/UX Design',
    'WordPress',
    'Bricks Builder',
    'Elementor',
    'Wix',
    'Squarespace',
    'Leadpages',
    'Custom CSS/JS',
    'Responsive Development',
  ];

  featuredProject: FeaturedProject = {
    title: 'Notable Design Co.',
    meta: 'UI/UX & WordPress Development · 1.5+ Years',
    description:
      "An ongoing collaboration spanning Notable's own website and a range of client projects. I help design, build, refine, and maintain digital experiences across multiple platforms.",
    image: 'images/notable.jpg',
    url: 'https://notabledesign.co/',
  };

  projectsLabel = 'Selected projects completed through Notable Design Co.';

  projects: ClientProject[] = [
    {
      title: 'Affinity24',
      category: 'Web Design & Development',
      image: 'images/affinity24.jpg',
      url: 'https://affinity24.com/',
    },
    {
      title: 'Wine Education Council',
      category: 'WordPress Development',
      image: 'images/wine-education-council.jpg',
      url: 'https://wineeducationcouncil.org/',
    },
    {
      title: 'Holy Grail Wine Company',
      category: 'Website Design & Development',
      image: 'images/holy-grail.jpg',
      url: 'https://holygrailwine.com/',
    },
    {
      title: 'Plumbing / Drain Cleaning Website',
      category: 'Landing Page Development',
      image: 'images/plumbing.jpg',
      url: '',
    },
    {
      title: 'Xtreme Autosports',
      category: 'Website Design & Development',
      image: 'images/xtremeauto.jpg',
      url: 'https://xtremeautosportsscv.com/',
    },
  ];
}
