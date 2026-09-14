import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { RevealHandle, revealOnScroll } from '../../core/reveal';

/**
 * About section — ported from the "DESKTOP ABOUT" / "MOBILE ABOUT"
 * gsap.matchMedia() blocks in script.js. Desktop pins the section and
 * scrubs through four cards; mobile just reveals each card on scroll.
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private mm?: gsap.MatchMedia;
  private copyReveal?: RevealHandle;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const aboutSection = document.querySelector('#about');
    const aboutBar = document.querySelector('#about-bar');
    const aboutCount = document.querySelector<HTMLElement>('#about-count');

    // Heading + intro paragraphs fade up as the section is approached —
    // same on desktop and mobile, and independent of the pinned card
    // story / color scrub above, so it fires once as you scroll in.
    this.copyReveal = revealOnScroll(document, '.about-copy h2, .about-copy p', {
      start: 'top 78%',
    });

    this.mm = gsap.matchMedia();

    this.mm.add('(min-width: 901px)', () => {
      if (!aboutSection || !aboutBar || !aboutCount) {
        return;
      }

      gsap.set('#about', { backgroundColor: '#eeeeee', color: '#101114' });
      gsap.set('.about-copy p', { color: 'rgba(16,17,20,.68)' });
      gsap.set('.about-copy strong', { color: '#101114' });
      gsap.set('#about-count', { color: 'rgba(16,17,20,.65)' });
      gsap.set('.about-progress .bar', { backgroundColor: 'rgba(16,17,20,.18)' });
      gsap.set('.about-image', { filter: 'blur(0px)', opacity: 1, scale: 1 });
      gsap.set('.about-card', { autoAlpha: 0, y: 50, scale: 0.985 });
      gsap.set(aboutBar, { width: '0%' });

      aboutCount.textContent = '01/05';

      function updateAboutProgress(progress: number): void {
        const p = gsap.utils.clamp(0, 1, progress);
        gsap.set(aboutBar, { width: `${p * 100}%` });

        let step = 1;
        if (p >= 0.15) step = 2;
        if (p >= 0.36) step = 3;
        if (p >= 0.57) step = 4;
        if (p >= 0.78) step = 5;

        aboutCount!.textContent = `${String(step).padStart(2, '0')}/05`;
      }

      const aboutTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5}`,
          scrub: 0.65,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self: any) {
            updateAboutProgress(self.progress);
          },
        },
      });

      aboutTimeline.to({}, { duration: 0.55 });

      aboutTimeline.to('#about', {
        backgroundColor: '#07090e',
        color: '#eeeeee',
        duration: 0.55,
        ease: 'power1.inOut',
      });
      aboutTimeline.to('.about-copy p', { color: 'rgba(238,238,238,.68)', duration: 0.55 }, '<');
      aboutTimeline.to('.about-copy strong', { color: '#eeeeee', duration: 0.55 }, '<');
      aboutTimeline.to('#about-count', { color: 'rgba(238,238,238,.55)', duration: 0.55 }, '<');
      aboutTimeline.to(
        '.about-progress .bar',
        { backgroundColor: 'rgba(238,238,238,.18)', duration: 0.55 },
        '<',
      );

      aboutTimeline.to('.about-image', {
        filter: 'blur(11px)',
        opacity: 0.46,
        scale: 1.05,
        duration: 0.65,
        ease: 'power2.inOut',
      });
      aboutTimeline.to(
        '.card-1',
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' },
        '<0.08',
      );

      aboutTimeline.to({}, { duration: 0.9 });

      aboutTimeline.to('.card-1', {
        autoAlpha: 0,
        y: -35,
        scale: 0.985,
        duration: 0.42,
        ease: 'power2.in',
      });

      aboutTimeline.fromTo(
        '.card-2',
        { autoAlpha: 0, y: 45, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' },
        '-=0.08',
      );
      aboutTimeline.to({}, { duration: 0.9 });
      aboutTimeline.to('.card-2', {
        autoAlpha: 0,
        y: -35,
        scale: 0.985,
        duration: 0.42,
        ease: 'power2.in',
      });

      aboutTimeline.fromTo(
        '.card-3',
        { autoAlpha: 0, y: 45, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' },
        '-=0.08',
      );
      aboutTimeline.to({}, { duration: 0.9 });
      aboutTimeline.to('.card-3', {
        autoAlpha: 0,
        y: -35,
        scale: 0.985,
        duration: 0.42,
        ease: 'power2.in',
      });

      aboutTimeline.fromTo(
        '.card-4',
        { autoAlpha: 0, y: 45, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' },
        '-=0.08',
      );

      aboutTimeline.to({}, { duration: 1.15 });

      return () => {
        gsap.set('.about-card', { clearProps: 'transform,opacity,visibility' });
        gsap.set('.about-image', { clearProps: 'filter,opacity,transform' });
        gsap.set('#about', { clearProps: 'backgroundColor,color' });
        gsap.set('.about-copy p', { clearProps: 'color' });
        gsap.set('.about-copy strong', { clearProps: 'color' });
        gsap.set('#about-count', { clearProps: 'color' });
        gsap.set('.about-progress .bar', { clearProps: 'backgroundColor' });
      };
    });

    this.mm.add('(max-width: 900px)', () => {
      if (!aboutSection || !aboutBar || !aboutCount) {
        return;
      }

      // Start light — same initial palette as desktop — then scrub to
      // dark as the section scrolls into view, instead of snapping to
      // dark immediately on load.
      gsap.set('#about', { backgroundColor: '#eeeeee', color: '#101114' });
      gsap.set('.about-copy p', { color: 'rgba(16,17,20,.68)' });
      gsap.set('.about-copy strong', { color: '#101114' });
      gsap.set('#about-count', { color: 'rgba(16,17,20,.65)' });
      gsap.set('.about-progress .bar', { backgroundColor: 'rgba(16,17,20,.18)' });
      gsap.set('.about-image', { filter: 'blur(0px)', opacity: 1, scale: 1 });
      gsap.set('.about-card', { opacity: 0, visibility: 'visible', y: 35 });

      const colorTween = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5,
        },
      });

      colorTween.to('#about', { backgroundColor: '#07090e', color: '#eeeeee', ease: 'none' }, 0);
      colorTween.to(
        '.about-copy p',
        { color: 'rgba(238,238,238,.68)', ease: 'none' },
        0,
      );
      colorTween.to('.about-copy strong', { color: '#eeeeee', ease: 'none' }, 0);
      colorTween.to('#about-count', { color: 'rgba(238,238,238,.55)', ease: 'none' }, 0);
      colorTween.to(
        '.about-progress .bar',
        { backgroundColor: 'rgba(238,238,238,.18)', ease: 'none' },
        0,
      );

      const mobileCards: any[] = gsap.utils.toArray('.about-card');
      mobileCards.forEach((card: any) => {
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

      const trigger = ScrollTrigger.create({
        trigger: '#about',
        start: 'top 70%',
        end: 'bottom 70%',
        onUpdate: (self: any) => {
          const progress = self.progress;
          gsap.set(aboutBar, { width: `${progress * 100}%` });
          const step = Math.min(5, Math.floor(progress * 5) + 1);
          aboutCount.textContent = `${String(step).padStart(2, '0')}/05`;
        },
      });

      return () => {
        trigger.kill();
        colorTween.scrollTrigger?.kill();
        colorTween.kill();
        gsap.set('.about-card', { clearProps: 'transform,opacity,visibility' });
        gsap.set('.about-image', { clearProps: 'filter,opacity,transform' });
        gsap.set('#about', { clearProps: 'backgroundColor,color' });
        gsap.set('.about-copy p', { clearProps: 'color' });
        gsap.set('.about-copy strong', { clearProps: 'color' });
        gsap.set('#about-count', { clearProps: 'color' });
        gsap.set('.about-progress .bar', { clearProps: 'backgroundColor' });
      };
    });
  }

  ngOnDestroy(): void {
    this.mm?.revert();
    this.copyReveal?.kill();
  }
}
