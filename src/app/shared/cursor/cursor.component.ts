import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import gsap from 'gsap';

/**
 * Global cursor accent: a small dot that tracks the pointer almost
 * instantly, and a larger, softly translucent ring around it that
 * trails behind with more ease — the classic "lead dot / lagging ring"
 * pairing. It's an addition on top of the normal cursor, not a
 * replacement — the native pointer stays visible throughout. Mounted
 * once in AppComponent (outside the router-outlet) so it persists
 * across every route instead of being torn down and rebuilt on
 * navigation.
 *
 * Desktop-only by design: it's gated behind the same
 * `(hover: hover) and (pointer: fine)` matchMedia query already used
 * for the Brands coverflow's hover state, so a visitor on a touch
 * device never gets it stuck on screen with no real pointer to move
 * it.
 */
@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [],
  templateUrl: './cursor.component.html',
  styleUrl: './cursor.component.scss',
})
export class CursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dot', { static: true }) private dotRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ring', { static: true }) private ringRef!: ElementRef<HTMLDivElement>;

  private mm?: gsap.MatchMedia;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.mm = gsap.matchMedia();

    this.mm.add('(hover: hover) and (pointer: fine)', () => {
      // Respect reduced-motion by skipping the extra moving elements
      // entirely, rather than adding motion we'd then have to suppress.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const dot = this.dotRef.nativeElement;
      const ring = this.ringRef.nativeElement;

      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

      // Dot: near-instant follow. Ring: same x/y target, longer
      // duration — it visibly trails a beat behind the dot.
      const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
      const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
      const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

      let revealed = false;

      const onMove = (event: PointerEvent) => {
        if (!revealed) {
          // Snap both straight to the pointer on the very first
          // movement instead of easing in from wherever they were
          // initialized, then fade in.
          gsap.set([dot, ring], { x: event.clientX, y: event.clientY });
          gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
          revealed = true;
        }

        moveDotX(event.clientX);
        moveDotY(event.clientY);
        moveRingX(event.clientX);
        moveRingY(event.clientY);
      };

      // Grow the ring slightly over links/buttons/anything clickable,
      // so the cursor gives a little feedback before the click.
      const growSelector = 'a, button, [role="button"], input, textarea, .visit-link';

      const onOver = (event: Event) => {
        if ((event.target as HTMLElement).closest?.(growSelector)) {
          ring.classList.add('is-active');
        }
      };
      const onOut = (event: Event) => {
        if ((event.target as HTMLElement).closest?.(growSelector)) {
          ring.classList.remove('is-active');
        }
      };

      // Hide while the pointer leaves the browser viewport entirely
      // (e.g. onto the OS taskbar), instead of leaving it stranded at
      // the last known position.
      const onDocLeave = (event: MouseEvent) => {
        if (!event.relatedTarget) {
          gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
          revealed = false;
        }
      };

      window.addEventListener('pointermove', onMove);
      document.addEventListener('pointerover', onOver);
      document.addEventListener('pointerout', onOut);
      document.addEventListener('mouseleave', onDocLeave);

      return () => {
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerover', onOver);
        document.removeEventListener('pointerout', onOut);
        document.removeEventListener('mouseleave', onDocLeave);
        gsap.set([dot, ring], { clearProps: 'all' });
      };
    });
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }
}
