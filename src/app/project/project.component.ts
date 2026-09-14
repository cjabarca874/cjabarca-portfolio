import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { Project, getNextProject, getProjectBySlug } from '../data/project';
import { ScrollService } from '../core/scroll.service';

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
      // land back at the top for the new project. Go through the Lenis-
      // aware scrollService instead of window.scrollTo, so Lenis's
      // internal scroll position stays in sync (a raw window.scrollTo
      // desyncs it and causes a visible jump on the next scroll).
      setTimeout(() => {
        this.scrollService.refresh();
        this.scrollService.scrollTo(0, { immediate: true });
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }
}
