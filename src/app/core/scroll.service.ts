import { Injectable, NgZone } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Central smooth-scroll + ScrollTrigger bootstrap, ported from the
 * original script.js. Registered once (from AppComponent) so every
 * page/section shares the same Lenis instance and GSAP ticker.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private lenis?: Lenis;
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

      this.lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
      });

      this.lenis.on('scroll', (event: { scroll: number }) => {
        ScrollTrigger.update();
        this.updateHeader(event.scroll);
      });

      gsap.ticker.add((time: number) => {
        this.lenis?.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

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

  /** Smooth-scroll to a section, mirroring the old anchor-link handler. */
  scrollTo(target: string | number | HTMLElement, options?: Record<string, unknown>): void {
    if (!this.lenis) {
      return;
    }
    this.lenis.scrollTo(target, { duration: 1.3, offset: 0, ...options });
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
