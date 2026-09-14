import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface RevealHandle {
  kill(): void;
}

/**
 * Fade-up-on-scroll entrance for headings/body text, shared across
 * sections so the timing/easing stays consistent site-wide. Each match
 * gets its OWN ScrollTrigger, so a stack of elements (e.g. a heading
 * followed by a few paragraphs) reveals itself one at a time as the
 * user scrolls past each one, rather than all firing together.
 *
 * The trigger position ("start") is viewport-relative, so this behaves
 * the same from desktop down to mobile without needing separate
 * matchMedia branches — same reason the existing per-card reveals
 * (about-card, work-card, brand-card) don't need them either.
 *
 * toggleActions is "play none none reverse" (same as those existing
 * card reveals) rather than a one-shot "play none none none" — with a
 * page this tall (multiple pinned sections stacking up huge scroll
 * distances), a trigger can end up measured against a still-settling
 * layout the instant it's created (images/fonts not done loading yet)
 * and fire before the user ever scrolls there. "reverse" lets the
 * refresh that already runs on window load / fonts.ready correct a
 * trigger that fired too early, instead of leaving it stuck "revealed"
 * with no real animation ever playing when the user reaches it.
 */
export function revealOnScroll(
  root: Element | Document,
  selector: string,
  options: {
    y?: number;
    duration?: number;
    start?: string;
  } = {},
): RevealHandle {
  const { y = 28, duration = 0.85, start = 'top 85%' } = options;

  const targets = Array.from(root.querySelectorAll(selector));

  if (!targets.length) {
    return { kill: () => {} };
  }

  const triggers: ScrollTrigger[] = [];

  targets.forEach((el) => {
    const tween = gsap.from(el, {
      y,
      opacity: 0,
      duration,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none reverse',
      },
    });

    if (tween.scrollTrigger) {
      triggers.push(tween.scrollTrigger);
    }
  });

  return {
    kill: () => {
      triggers.forEach((trigger) => trigger.kill());
      gsap.set(targets, { clearProps: 'transform,opacity' });
    },
  };
}
