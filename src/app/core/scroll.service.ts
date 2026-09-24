import { Injectable, NgZone } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Native scrolling + ScrollTrigger bootstrap shared across routes.
 * Browser scrolling avoids the client-work flicker seen with scroll smoothing.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private ready = false;
  private isHeaderScrolled = false;
  private headerListeners: Array<(scrolled: boolean) => void> = [];

  constructor(private zone: NgZone) {}

  init(): void {
    if (this.ready || typeof window === 'undefined') {
      return;
    }

    this.zone.runOutsideAngular(() => {
      gsap.registerPlugin(ScrollTrigger);

      // ScrollTrigger handles native scroll events itself.
      window.addEventListener('scroll', () => {
        this.updateHeader(window.scrollY);
      }, { passive: true });

      this.updateHeader(window.scrollY);

      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
        this.updateHeader(window.scrollY);
      });

      // Custom fonts (e.g. font-display: swap) can finish loading and
      // reflow text after the initial `load` refresh above, which would
      // otherwise leave ScrollTrigger's pinned sections measured against
      // stale layout and cause them to jump mid-scroll.
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
          this.updateHeader(window.scrollY);
        });
      }

      let resizeTimer: ReturnType<typeof setTimeout>;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.refresh();
          this.updateHeader(window.scrollY);
        }, 200);
      });

      ScrollTrigger.refresh();
    });

    this.ready = true;
  }

  /** Keep section links and project navigation working with native scrolling. */
  scrollTo(target: string | number | HTMLElement): void {
    if (typeof window === 'undefined') {
      return;
    }
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element === null) {
      return;
    }
    const top = typeof element === 'number'
      ? element
      : element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'instant' });
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }

  onHeaderScrollChange(callback: (scrolled: boolean) => void): void {
    this.headerListeners.push(callback);
    callback(this.isHeaderScrolled);
  }

  private updateHeader(scrollPosition: number): void {
    const scrolled = scrollPosition > 50;
    if (scrolled === this.isHeaderScrolled) {
      return;
    }
    this.isHeaderScrolled = scrolled;
    this.zone.run(() => {
      this.headerListeners.forEach((cb) => cb(scrolled));
    });
  }
}
