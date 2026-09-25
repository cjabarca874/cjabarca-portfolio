import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';

import { PROJECTS, Project } from '../../data/project';
import { RevealHandle, revealOnScroll } from '../../core/reveal';

/**
 * Works section — pinned, crossfading project gallery on desktop
 * (ported from the "DESKTOP WORK STAGE" block in script.js), and a
 * plain stacked scroll reveal on mobile ("MOBILE WORKS").
 */
@Component({
  selector: 'app-works',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './works.component.html',
  styles: [':host { display: block; }'],
})
export class WorksComponent implements AfterViewInit, OnDestroy {
  projects: Project[] = PROJECTS;

  private mm?: gsap.MatchMedia;
  private headReveal?: RevealHandle;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Section heading + intro copy fade up as they scroll into view —
    // same treatment on desktop and mobile, independent of the
    // pinned/stacked gallery choreography below.
    this.headReveal = revealOnScroll(document, '.works-head h2, .works-head p');

    const workStage = document.querySelector('.work-stage');
    const worksBar = document.querySelector('#works-bar');
    const worksCount = document.querySelector<HTMLElement>('#works-count');

    this.mm = gsap.matchMedia();

    this.mm.add('(min-width: 901px)', () => {
      if (!workStage || !worksBar || !worksCount) {
        return;
      }

      const images: any[] = gsap.utils.toArray('.work-image');
      const cards: any[] = gsap.utils.toArray('.work-card');
      const total = cards.length;

      gsap.set(images, { opacity: 0, scale: 1.06 });
      gsap.set(images[0], { opacity: 1, scale: 1 });

      gsap.set(cards, { autoAlpha: 0, y: 40 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0 });

      gsap.set(worksBar, { width: '0%' });

      worksCount.textContent = `01/${String(total).padStart(2, '0')}`;

      function updateWorksProgress(progress: number): void {
        const p = gsap.utils.clamp(0, 1, progress);
        gsap.set(worksBar, { width: `${p * 100}%` });

        const step = Math.min(total, Math.floor(p * total) + 1);
        worksCount!.textContent = `${String(step).padStart(2, '0')}/${String(
          total,
        ).padStart(2, '0')}`;
      }

      const worksTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: workStage,
          start: 'top top',
          end: () => `+=${window.innerHeight * total}`,
          scrub: 0.65,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self: any) {
            updateWorksProgress(self.progress);
          },
        },
      });

      worksTimeline.to({}, { duration: 0.6 });

      for (let i = 0; i < total - 1; i++) {
        worksTimeline.to(images[i], { opacity: 0, duration: 0.55, ease: 'power2.inOut' });

        worksTimeline.to(
          images[i + 1],
          { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.inOut' },
          '<',
        );

        worksTimeline.to(
          cards[i],
          { autoAlpha: 0, y: -35, duration: 0.42, ease: 'power2.in' },
          '<',
        );

        worksTimeline.fromTo(
          cards[i + 1],
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' },
          '-=0.12',
        );

        worksTimeline.to({}, { duration: 0.6 });
      }

      return () => {
        gsap.set(images, { clearProps: 'opacity,transform' });
        gsap.set(cards, { clearProps: 'opacity,visibility,transform' });
      };
    });

    this.mm.add('(max-width: 900px)', () => {
      if (!workStage) {
        return;
      }

      const cards: any[] = gsap.utils.toArray('.work-card');

      gsap.set(cards, { opacity: 0, y: 35 });

      cards.forEach((card: any) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      return () => {
        gsap.set(cards, { clearProps: 'opacity,transform' });
      };
    });
  }

  ngOnDestroy(): void {
    this.mm?.revert();
    this.headReveal?.kill();
  }
}
