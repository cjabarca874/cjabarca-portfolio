import { Injectable, NgZone, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** One shared scroll driver for navigation, pinned scenes, and header state. */
@Injectable({ providedIn: 'root' })
export class ScrollService implements OnDestroy {
  private ready = false;
  private isHeaderScrolled = false;
  private headerListeners: Array<(scrolled: boolean) => void> = [];
  private cleanup = () => {};
  constructor(private zone: NgZone) {}

  init(): void {
    if (this.ready || typeof window === 'undefined') return;
    this.ready = true;
    this.zone.runOutsideAngular(() => {
      gsap.registerPlugin(ScrollTrigger);
      const onScroll = () => this.updateHeader(window.scrollY);
      // Refresh can change pin-spacer heights after video/font loading.
      const onRefresh = () => { onScroll(); };
      const refresh = () => ScrollTrigger.refresh();
      let resizeTimer: ReturnType<typeof setTimeout>;
      let destroyed = false;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 200);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('load', refresh);
      window.addEventListener('resize', onResize);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      document.fonts?.ready.then(() => { if (!destroyed) refresh(); });
      onScroll();
      refresh();
      this.cleanup = () => {
        destroyed = true;
        clearTimeout(resizeTimer);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('load', refresh);
        window.removeEventListener('resize', onResize);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
      };
    });
  }

  scrollTo(target: string | number | HTMLElement, immediate = false): void {
    if (typeof window === 'undefined') return;
    const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (element === null) return;
    const top = typeof element === 'number' ? element : element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
  }
  refresh(): void { ScrollTrigger.refresh(); }
  onHeaderScrollChange(callback: (scrolled: boolean) => void): void {
    this.headerListeners.push(callback);
    callback(this.isHeaderScrolled);
  }
  private updateHeader(scrollPosition: number): void {
    const scrolled = scrollPosition > 50;
    if (scrolled === this.isHeaderScrolled) return;
    this.isHeaderScrolled = scrolled;
    this.zone.run(() => this.headerListeners.forEach(cb => cb(scrolled)));
  }
  ngOnDestroy(): void { this.cleanup(); }
}
