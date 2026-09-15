import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import gsap from 'gsap';

import { RevealHandle, revealOnScroll } from '../../core/reveal';

interface CoverflowController {
  coverflowVars: (i: number, center: number) => Record<string, number>;
  renderCoverflow: (center: number) => void;
  startAutoplay: () => void;
  stopAutoplay: () => void;
  enableDrag: () => void;
  destroy: () => void;
  setCenter: (value: number) => void;
}

/**
 * Brands / clients section — an autoplaying, draggable 3D coverflow on
 * desktop (min-width: 901px). On mobile the cards lay out as a plain
 * static 2-column grid (handled entirely by CSS — see the "(max-width:
 * 900px)" block in styles.css); the only JS that still runs below that
 * breakpoint is a small scroll-scrubbed background/text color fade from
 * light to dark, mirroring the desktop entrance transition.
 */
@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [],
  templateUrl: './brands.component.html',
})
export class BrandsComponent implements AfterViewInit, OnDestroy {
  private mm?: gsap.MatchMedia;
  private headReveal?: RevealHandle;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Eyebrow + heading + intro copy fade up as the section is
    // approached — same on desktop and mobile, independent of the
    // coverflow/color entrance below.
    this.headReveal = revealOnScroll(
      document,
      '.brands-head .brands-eyebrow, .brands-head h2, .brands-head p',
    );

    this.mm = gsap.matchMedia();

    this.mm.add('(min-width: 901px)', () => {
      const brandsSection = document.querySelector('.brands');
      const brandsStage = document.querySelector<HTMLElement>('.brands-stage');
      const cards: any[] = gsap.utils.toArray('.brand-card');

      if (!brandsSection || !brandsStage || !cards.length) {
        return;
      }

      const controller = this.createCoverflowController(cards, brandsStage, 340, 320);

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(brandsSection, { backgroundColor: '#03060a', color: '#eeeeee' });
        gsap.set('.brands-head p', { color: 'rgba(238,238,238,.6)' });

        controller.renderCoverflow(0);
        controller.enableDrag();

        return () => {
          controller.destroy();
          gsap.set(brandsSection, { clearProps: 'backgroundColor,color' });
          gsap.set('.brands-head p', { clearProps: 'color' });
        };
      }

      const gridCols = 4;
      const gridRows = Math.ceil(cards.length / gridCols);
      const cellW = 230;
      const cellH = 170;

      cards.forEach((card, i) => {
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: (col - (gridCols - 1) / 2) * cellW,
          y: (row - (gridRows - 1) / 2) * cellH,
          z: 0,
          rotationY: 0,
          scale: 1,
          opacity: 1,
          zIndex: 1,
        });
      });

      let autoplayIsOn = false;

      const entranceTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: brandsSection,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          scrub: 0.3,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self: any) => {
            if (self.progress < 1 && autoplayIsOn) {
              autoplayIsOn = false;
              controller.stopAutoplay();
            }
          },
        },
        onComplete: () => {
          controller.setCenter(0);
          autoplayIsOn = true;
          controller.startAutoplay();
          // Only becomes grab/draggable once it's actually the
          // coverflow, not while it's still showing as a grid. Hover
          // grow works in every phase (see cardHoverCleanups below),
          // so it doesn't need to wait for this.
          controller.enableDrag();
        },
      });

      entranceTimeline.to(
        brandsSection,
        { backgroundColor: '#03060a', color: '#eeeeee', duration: 1, ease: 'power1.inOut' },
        0,
      );

      entranceTimeline.to(
        '.brands-head p',
        { color: 'rgba(238,238,238,.6)', duration: 1, ease: 'power1.inOut' },
        0,
      );

      cards.forEach((card, i) => {
        entranceTimeline.to(
          card,
          { ...controller.coverflowVars(i, 0), duration: 1.1, ease: 'power3.inOut' },
          0.1 + i * 0.05,
        );
      });

      return () => {
        entranceTimeline.scrollTrigger?.kill();
        entranceTimeline.kill();
        controller.destroy();
        gsap.set(brandsSection, { clearProps: 'backgroundColor,color' });
        gsap.set('.brands-head p', { clearProps: 'color' });
      };
    });

    // Mobile (max-width: 900px): still a static CSS grid — no coverflow,
    // drag, or autoplay — but the section background/text still scrubs
    // from light to dark on scroll, mirroring the desktop entrance
    // transition instead of snapping straight to dark on load.
    this.mm.add('(max-width: 900px)', () => {
      const brandsSection = document.querySelector('.brands');

      if (!brandsSection) {
        return;
      }

      gsap.set(brandsSection, { backgroundColor: '#eeeeee', color: '#101114' });
      gsap.set('.brands-head p', { color: 'rgba(16,17,20,.7)' });

      const colorTween = gsap.timeline({
        scrollTrigger: {
          trigger: brandsSection,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5,
        },
      });

      colorTween.to(
        brandsSection,
        { backgroundColor: '#03060a', color: '#eeeeee', ease: 'none' },
        0,
      );
      colorTween.to('.brands-head p', { color: 'rgba(238,238,238,.6)', ease: 'none' }, 0);

      return () => {
        colorTween.scrollTrigger?.kill();
        colorTween.kill();
        gsap.set(brandsSection, { clearProps: 'backgroundColor,color' });
        gsap.set('.brands-head p', { clearProps: 'color' });
      };
    });
  }

  ngOnDestroy(): void {
    this.mm?.revert();
    this.headReveal?.kill();
  }

  private createCoverflowController(
    cards: any[],
    stage: HTMLElement,
    radius: number,
    depth: number,
  ): CoverflowController {
    const total = cards.length;
    const angleStep = 360 / total;

    function coverflowVars(i: number, center: number) {
      const angleDeg = (i - center) * angleStep;
      const rad = (angleDeg * Math.PI) / 180;
      const front = (Math.cos(rad) + 1) / 2;

      return {
        x: Math.sin(rad) * radius,
        y: 0,
        z: -(1 - front) * depth,
        rotationY: -angleDeg,
        scale: 0.55 + front * 0.85,
        opacity: 0.18 + front * 0.82,
        zIndex: Math.round(front * 100),
      };
    }

    function renderCoverflow(center: number): void {
      cards.forEach((card, i) => {
        gsap.set(card, { xPercent: -50, yPercent: -50, ...coverflowVars(i, center) });
      });
    }

    let currentCenter = 0;
    let autoplayStarted = false;
    let paused = false;
    let dragging = false;
    let dragEnabled = false;
    let lastTime: number | null = null;
    let tick: ((time: number) => void) | null = null;

    function startAutoplay(): void {
      if (autoplayStarted) {
        return;
      }
      autoplayStarted = true;

      tick = (time: number) => {
        if (lastTime === null) {
          lastTime = time;
        }
        const delta = time - lastTime;
        lastTime = time;

        if (paused || dragging) {
          // Nothing is actually moving while paused (e.g. the pointer
          // is hovering the stage — see mouseenter/mouseleave below)
          // or mid-drag (onPointerMove already re-renders directly).
          // Skip re-running gsap.set on every card here too: doing it
          // unconditionally every frame competed with the CSS
          // hover/blur transition below for main-thread time right
          // when it mattered most, which was the visible stutter.
          return;
        }

        currentCenter += 0.35 * delta;
        renderCoverflow(currentCenter);
      };

      gsap.ticker.add(tick);
    }

    function stopAutoplay(): void {
      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      lastTime = null;
      autoplayStarted = false;
      dragging = false;
      stage.classList.remove('is-dragging');
    }

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };

    stage.addEventListener('mouseenter', pause);
    stage.addEventListener('mouseleave', resume);

    // Hover "grow" for an individual card. This used to be a CSS
    // width/height transition (see styles.css), which forces layout
    // + repaint on every frame it's animating — stacked on top of the
    // coverflow's own per-frame 3D transform updates, that was the
    // visible stutter on hover. Doing the grow as a GSAP scale tween
    // instead keeps it compositor-only, like the rest of the
    // coverflow. zIndex is bumped well above the coverflow's own
    // 0-100 range so the hovered card is always frontmost regardless
    // of its position in the ring.
    //
    // What to grow FROM, and shrink back TO on mouseleave, is read
    // directly off the card itself at the moment the hover starts —
    // gsap.getProperty gives whatever GSAP currently has it at,
    // whether that's the initial grid (scale 1), mid-flight through
    // the scroll-driven entrance transition, or the fully-formed
    // coverflow. Capturing the real live value instead of recomputing
    // an assumed formula (coverflowVars, or a hardcoded "1") is what
    // guarantees mouseleave always restores the exact size the card
    // actually had — that mismatch is what previously left a hovered
    // card stuck oversized instead of shrinking back.
    const cardHoverCleanups: Array<() => void> = [];

    cards.forEach((card) => {
      let baseline: { scale: number; zIndex: number } | null = null;

      const onCardEnter = () => {
        baseline = {
          scale: gsap.getProperty(card, 'scale') as number,
          zIndex: gsap.getProperty(card, 'zIndex') as number,
        };
        gsap.to(card, {
          scale: baseline.scale * 1.18,
          zIndex: 999,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const onCardLeave = () => {
        if (!baseline) {
          return;
        }
        gsap.to(card, {
          scale: baseline.scale,
          zIndex: baseline.zIndex,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        baseline = null;
      };

      card.addEventListener('mouseenter', onCardEnter);
      card.addEventListener('mouseleave', onCardLeave);

      cardHoverCleanups.push(() => {
        card.removeEventListener('mouseenter', onCardEnter);
        card.removeEventListener('mouseleave', onCardLeave);
      });
    });

    const dragSensitivity = 140;
    let dragStartX = 0;
    let dragStartCenter = 0;

    function onPointerDown(event: PointerEvent): void {
      if (!dragEnabled) {
        return;
      }
      dragging = true;
      dragStartX = event.clientX;
      dragStartCenter = currentCenter;
      stage.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent): void {
      if (!dragging) {
        return;
      }
      const deltaX = event.clientX - dragStartX;
      currentCenter = dragStartCenter - deltaX / dragSensitivity;
      renderCoverflow(currentCenter);
    }

    function onPointerUp(event: PointerEvent): void {
      dragging = false;
      stage.classList.remove('is-dragging');
      stage.releasePointerCapture(event.pointerId);
    }

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);

    function destroy(): void {
      stopAutoplay();
      stage.removeEventListener('mouseenter', pause);
      stage.removeEventListener('mouseleave', resume);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      cardHoverCleanups.forEach((cleanup) => cleanup());
      stage.classList.remove('is-dragging', 'is-draggable');
      gsap.set(cards, { clearProps: 'all' });
    }

    // Dragging (and the "grab" cursor) is off by default — it only
    // turns on once the caller says this is actually a coverflow, not
    // while the cards are still sitting in their grid/entrance layout.
    function enableDrag(): void {
      dragEnabled = true;
      stage.classList.add('is-draggable');
    }

    return {
      coverflowVars,
      renderCoverflow,
      startAutoplay,
      stopAutoplay,
      enableDrag,
      destroy,
      setCenter: (value: number) => {
        currentCenter = value;
      },
    };
  }
}
