import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ScrollService } from '../core/scroll.service';
import { HeroComponent } from './hero/hero.component';
import { AboutComponent } from './about/about.component';
import { WorksComponent } from './works/works.component';
import { BrandsComponent } from './brands/brands.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, AboutComponent, WorksComponent, BrandsComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private fragmentSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private scrollService: ScrollService,
  ) {}

  ngAfterViewInit(): void {
    this.fragmentSub = this.route.fragment.subscribe((fragment) => {
      if (!fragment) {
        return;
      }

      // Wait a tick so the section components (and their images/layout)
      // have finished rendering, then let ScrollTrigger know the page
      // changed size before smooth-scrolling to the target section.
      setTimeout(() => {
        this.scrollService.refresh();
        this.scrollService.scrollTo(`#${fragment}`);
      }, 50);
    });
  }

  ngOnDestroy(): void {
    this.fragmentSub?.unsubscribe();
  }
}
