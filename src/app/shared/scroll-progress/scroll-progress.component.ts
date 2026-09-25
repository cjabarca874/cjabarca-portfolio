import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-scroll-progress', standalone: true,
  template: `<div #badge class="scroll-percentage" role="progressbar" aria-label="Page scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-hidden="true">
    <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="ring-track" cx="50" cy="50" r="44" />
      <circle #fill class="ring-fill" cx="50" cy="50" r="44" pathLength="100" />
    </svg>
    <span class="progress-value"><span #value>0</span><span class="percent-sign">%</span></span>
  </div>`,
  styleUrl: './scroll-progress.component.scss',
})
export class ScrollProgressComponent implements AfterViewInit, OnDestroy {
  @ViewChild('badge', { static: true }) badgeRef!: ElementRef<HTMLElement>;
  @ViewChild('value', { static: true }) valueRef!: ElementRef<HTMLElement>;
  @ViewChild('fill', { static: true }) fillRef!: ElementRef<SVGCircleElement>;
  private cleanup = () => {};
  constructor(private zone: NgZone) {}
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      let frame = 0;
      let last = -1;
      const update = () => {
        frame = 0;
        const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const ratio = maximum ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
        const percent = Math.round(ratio * 100);
        const visible = window.scrollY > 4 && maximum > 0;
        const badge = this.badgeRef.nativeElement;
        badge.classList.toggle('is-visible', visible);
        badge.setAttribute('aria-hidden', String(!visible));
        if (percent !== last) {
          last = percent;
          this.valueRef.nativeElement.textContent = String(percent);
          badge.setAttribute('aria-valuenow', String(percent));
        }
        this.fillRef.nativeElement.style.strokeDashoffset = String(100 - ratio * 100);
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      const observer = new ResizeObserver(schedule);
      observer.observe(document.body);
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      ScrollTrigger.addEventListener('refresh', schedule);
      update();
      this.cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        ScrollTrigger.removeEventListener('refresh', schedule);
      };
    });
  }
  ngOnDestroy(): void { this.cleanup(); }
}
