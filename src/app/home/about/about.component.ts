import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-about', standalone: true, imports: [RouterLink],
  templateUrl: './about.component.html', styleUrl: './about.component.scss',
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private mm?: gsap.MatchMedia;
  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.mm = gsap.matchMedia();
      const root = this.host.nativeElement;
      const section = root.querySelector<HTMLElement>('#about')!;
      const paragraphs = root.querySelectorAll('.about-copy p');
      const photo = root.querySelector('.about-image');
      const cards = root.querySelectorAll('.about-card');
      const progress = root.querySelector('.about-progress');
      const bar = root.querySelector('#about-bar');
      const count = root.querySelector('#about-count')!;
      this.mm.add({
        all: '(min-width: 0px)',
        desktop: '(min-width: 901px) and (min-height: 760px)',
        reduce: '(prefers-reduced-motion: reduce)',
      }, context => {
        const desktop = !!context.conditions?.['desktop'];
        const reduced = !!context.conditions?.['reduce'];
        section.classList.toggle('about-flow', !desktop || reduced);
        gsap.set(section, { backgroundColor: '#ffffff', color: '#17191e' });
        gsap.set(paragraphs, { color: 'rgba(23,25,30,.72)' });
        gsap.set(count, { color: 'inherit' });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section, start: desktop && !reduced ? 'top top' : 'top 35%',
            end: () => desktop && !reduced ? '+=' + window.innerHeight * 4.5 : 'top top',
            pin: desktop && !reduced, pinSpacing: true, refreshPriority: 10,
            scrub: reduced ? true : 0.5, invalidateOnRefresh: true,
          },
        });
        timeline.to(section, { backgroundColor: '#07090e', color: '#eeeeee', duration: 1 }, 0)
          .to(paragraphs, { color: 'rgba(238,238,238,.72)', duration: 1 }, 0);
        if (desktop && !reduced) {
          gsap.set(cards, { autoAlpha: 0, y: 45 });
          gsap.set(photo, { opacity: 1, filter: 'blur(0px)' });
          timeline.to(photo, { opacity: 0.3, filter: 'blur(8px)', duration: 0.5 });
          cards.forEach((card, index) => {
            if (index) timeline.to(cards[index - 1], { autoAlpha: 0, y: -30, duration: 0.35 });
            timeline.to(card, { autoAlpha: 1, y: 0, duration: 0.55 });
            timeline.to({}, { duration: 0.75 });
          });
          timeline.eventCallback('onUpdate', () => {
            const value = timeline.progress();
            gsap.set(bar, { width: value * 100 + '%' });
            count.textContent = String(Math.min(5, Math.floor(value * 5) + 1)).padStart(2, '0') + '/05';
          });
        } else {
          gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(photo, { opacity: 1, filter: 'none', scale: 1 });
          gsap.set(progress, { display: 'none' });
        }
        return () => { section.classList.remove('about-flow'); };
      }, root);
      ScrollTrigger.refresh();
    });
  }
  ngOnDestroy(): void { this.mm?.revert(); }
}
