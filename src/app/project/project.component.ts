import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import gsap from 'gsap';
import { Subscription } from 'rxjs';

import { Project, getNextProject, getProjectBySlug } from '../data/project';
import { ScrollService } from '../core/scroll.service';
import { RevealHandle, revealOnScroll } from '../core/reveal';

/**
 * Project detail page — one shared template for every project, filled
 * in from the PROJECTS data based on the :slug route param. Ported
 * from the project.html + project.js + project-data.js combination.
 */
@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project.component.html',
})
export class ProjectComponent implements OnInit, OnDestroy {
  project!: Project;
  nextProject!: Project;

  private paramsSub?: Subscription;
  private heroRevealTween?: gsap.core.Tween;
  private bodyReveal?: RevealHandle;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private scrollService: ScrollService,
  ) {}

  ngOnInit(): void {
    this.paramsSub = this.route.paramMap.subscribe((params) => {
      this.project = getProjectBySlug(params.get('slug'));
      this.nextProject = getNextProject(this.project);

      this.title.setTitle(`${this.project.title} — Abarca CJ`);

      // Layout height changed (new page), so let ScrollTrigger know and
      // land back at the top for the new project using native scrolling.
      setTimeout(() => {
        this.scrollService.refresh();
        this.scrollService.scrollTo(0, true);

        // Re-run the entrance animations on every project (the *ngFor
        // meta/overview content gets rebuilt each time, so old
        // ScrollTriggers would otherwise be pointing at stale nodes).
        this.heroRevealTween?.kill();
        this.bodyReveal?.kill();

        // Hero block is already in view the moment the page lands, so
        // it plays immediately rather than waiting on a scroll trigger
        // (same idea as the homepage Hero section).
        this.heroRevealTween = gsap.from(
          '.project-hero .project-back, .project-hero .project-tag, .project-hero h1, .project-hero .project-sub',
          { y: 28, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
        );

        // Everything further down fades up as it's scrolled into view.
        this.bodyReveal = revealOnScroll(
          document,
          '.project-body h2, .project-body p, .project-meta, .project-next-link',
          { start: 'top 88%' },
        );
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
    this.heroRevealTween?.kill();
    this.bodyReveal?.kill();
  }
}
