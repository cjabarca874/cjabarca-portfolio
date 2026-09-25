import { Injectable, NgZone, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/** One shared scroll driver for navigation, pinned scenes, and header state. */
@Injectable({ providedIn: 'root' })
export class ScrollService implements OnDestroy {
  private ready = false;
  private lenis?: Lenis;
  private isHeaderScrolled = false;
  private headerListeners: Array<(scrolled: boolean) => void> = [];
  private cleanup = () => {};
  constructor(private zone: NgZone) {}

  init(): void {
    if (this.ready || typeof window === 'undefined') return;
    this.ready = true;
    this.zone.runOutsideAngular(() => {
      gsap.registerPlugin(ScrollTrigger);
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const tick = (time: number) => this.lenis?.raf(time * 1000);
      const syncMenu = () => {
        if (document.body.classList.contains('menu-open')) this.lenis?.stop();
        else this.lenis?.start();
      };
      const configure = () => {
        gsap.ticker.remove(tick);
        this.lenis?.destroy();
        this.lenis = undefined;
        if (!motion.matches) {
          this.lenis = new Lenis({
            autoRaf: false,
            lerp: 0.1,
            smoothWheel: true,
            syncTouch: false,
            anchors: true,
          });
          this.lenis.on('scroll', ScrollTrigger.update);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
          syncMenu();
        }
      };
      const onScroll = () => this.updateHeader(window.scrollY);
      // Refresh can change pin-spacer heights after video/font loading.
      const onRefresh = () => { this.lenis?.resize(); onScroll(); };
      const refresh = () => ScrollTrigger.refresh();
      let resizeTimer: ReturnType<typeof setTimeout>;
      let destroyed = false;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 200);
      };
      const menuObserver = new MutationObserver(syncMenu);
      menuObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      motion.addEventListener('change', configure);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('load', refresh);
      window.addEventListener('resize', onResize);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      document.fonts?.ready.then(() => { if (!destroyed) refresh(); });
      configure();
      onScroll();
      refresh();
      this.cleanup = () => {
        destroyed = true;
        clearTimeout(resizeTimer);
        menuObserver.disconnect();
        motion.removeEventListener('change', configure);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('load', refresh);
        window.removeEventListener('resize', onResize);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        gsap.ticker.remove(tick);
        this.lenis?.destroy();
        this.lenis = undefined;
      };
    });
  }

  scrollTo(target: string | number | HTMLElement, immediate = false): void {
    if (typeof window === 'undefined') return;
    const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (element === null) return;
    if (this.lenis) {
      this.lenis.scrollTo(element, { immediate });
      return;
    }
    const top = typeof element === 'number' ? element : element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'instant' });
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
