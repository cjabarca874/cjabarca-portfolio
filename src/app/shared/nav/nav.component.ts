import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { ScrollService } from '../../core/scroll.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit, OnDestroy {
  menuOpen = false;
  headerScrolled = false;

  private navSub?: Subscription;
  private resizeHandler = () => {
    if (window.innerWidth > 900) {
      this.closeMenu();
    }
  };
  private keyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  };

  constructor(
    private scrollService: ScrollService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.scrollService.onHeaderScrollChange((scrolled) => {
      this.headerScrolled = scrolled;
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeHandler);
      document.addEventListener('keydown', this.keyHandler);
    }

    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => this.closeMenu());
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
      document.removeEventListener('keydown', this.keyHandler);
    }
    this.navSub?.unsubscribe();
  }

  toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu(): void {
    this.menuOpen = true;
    document.body.classList.add('menu-open');
  }

  private closeMenu(): void {
    if (!this.menuOpen) {
      return;
    }
    this.menuOpen = false;
    document.body.classList.remove('menu-open');
  }
}
