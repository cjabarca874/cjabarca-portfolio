import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import * as THREE from 'three';

/**
 * Hero section: reveal-in headline, an infinite marquee strip, and a
 * WebGL drifting-particle background — ported from hero-effect.js
 * (Three.js) and the hero-related bits of script.js (GSAP).
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection', { static: true }) heroRef!: ElementRef<HTMLElement>;
  @ViewChild('fxCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer?: THREE.WebGLRenderer;
  private rafId = 0;
  private destroyed = false;

  private resizeHandler?: () => void;
  private marqueeResizeHandler?: () => void;
  private pointerMoveHandler?: (event: PointerEvent) => void;
  private observer?: IntersectionObserver;
  private marqueeTick?: () => void;
  private heroRevealTween?: gsap.core.Tween;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.setupHeroReveal();
    this.setupMarquee();
    this.setupParticles();
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.pointerMoveHandler) {
      window.removeEventListener('pointermove', this.pointerMoveHandler);
    }
    if (this.marqueeResizeHandler) {
      window.removeEventListener('resize', this.marqueeResizeHandler);
    }
    if (this.marqueeTick) {
      gsap.ticker.remove(this.marqueeTick);
    }
    this.observer?.disconnect();
    this.heroRevealTween?.kill();
    this.renderer?.dispose();
  }

  private setupHeroReveal(): void {
    const reveals = this.heroRef.nativeElement.querySelectorAll('.hero-reveal');
    if (!reveals.length) {
      return;
    }
    this.heroRevealTween = gsap.from(reveals, {
      y: 36,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      delay: 0.15,
      ease: 'power3.out',
    });
  }

  private setupMarquee(): void {
    const track = this.heroRef.nativeElement.querySelector(
      '.hero-marquee .track',
    ) as HTMLElement | null;
    if (!track) {
      return;
    }

    const setX = gsap.quickSetter(track, 'x', 'px') as (value: number) => void;
    let x = 0;
    const speed = 40;
    let segmentWidth = track.scrollWidth / 3;

    this.marqueeResizeHandler = () => {
      segmentWidth = track.scrollWidth / 3;
    };
    window.addEventListener('resize', this.marqueeResizeHandler);

    this.marqueeTick = () => {
      x -= (speed * gsap.ticker.deltaRatio()) / 60;
      if (Math.abs(x) >= segmentWidth) {
        x += segmentWidth;
      }
      setX(x);
    };
    gsap.ticker.add(this.marqueeTick);
  }

  private setupParticles(): void {
    this.zone.runOutsideAngular(() => {
      const canvas = this.canvasRef.nativeElement;
      const hero = this.heroRef.nativeElement;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
      } catch {
        // No WebGL available — leave the hero without the effect.
        return;
      }
      this.renderer = renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x03060a, 0.09);

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 30);
      camera.position.set(0, 0, 6);

      const createSprite = (): THREE.CanvasTexture => {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;

        const ctx = c.getContext('2d')!;
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2,
        );

        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(c);
      };

      const sprite = createSprite();

      const count = 200;
      const bounds = { x: 7, yTop: 4, yBottom: -4, zNear: 3, zFar: -9 };

      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const speeds = new Float32Array(count);
      const phases = new Float32Array(count);
      const sway = new Float32Array(count);

      const white = new THREE.Color(0xeeeeee);
      const accent = new THREE.Color(0xf24836);

      const resetParticle = (i: number, randomizeY: boolean): void => {
        const ix = i * 3;

        positions[ix] = (Math.random() * 2 - 1) * bounds.x;
        positions[ix + 1] = randomizeY
          ? bounds.yBottom + Math.random() * (bounds.yTop - bounds.yBottom)
          : bounds.yBottom;
        positions[ix + 2] =
          bounds.zFar + Math.random() * (bounds.zNear - bounds.zFar);

        speeds[i] = 0.15 + Math.random() * 0.35;
        phases[i] = Math.random() * Math.PI * 2;
        sway[i] = 0.15 + Math.random() * 0.35;

        const mixed = white.clone().lerp(accent, Math.random() < 0.22 ? 1 : 0);
        colors[ix] = mixed.r;
        colors[ix + 1] = mixed.g;
        colors[ix + 2] = mixed.b;
      };

      for (let i = 0; i < count; i++) {
        resetParticle(i, true);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.09,
        map: sprite,
        transparent: true,
        opacity: 0.75,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const resize = (): void => {
        const width = hero.clientWidth || window.innerWidth;
        const height = hero.clientHeight || window.innerHeight;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      resize();
      this.resizeHandler = resize;
      window.addEventListener('resize', resize);

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      if (!prefersReducedMotion) {
        this.pointerMoveHandler = (event: PointerEvent) => {
          targetX = (event.clientX / window.innerWidth - 0.5) * 0.6;
          targetY = (event.clientY / window.innerHeight - 0.5) * -0.35;
        };
        window.addEventListener('pointermove', this.pointerMoveHandler);
      }

      let heroInView = true;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            heroInView = entry.isIntersecting;
          });
        },
        { threshold: 0 },
      );
      this.observer.observe(hero);

      const clock = new THREE.Clock();

      const tick = (): void => {
        if (this.destroyed) {
          return;
        }
        this.rafId = requestAnimationFrame(tick);

        if (!heroInView || document.hidden) {
          return;
        }

        const elapsed = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          const pos = geometry.attributes['position'] as THREE.BufferAttribute;
          const color = geometry.attributes['color'] as THREE.BufferAttribute;
          let colorChanged = false;

          const posArray = pos.array as Float32Array;

          for (let i = 0; i < count; i++) {
            const ix = i * 3;

            posArray[ix + 1] += speeds[i] * 0.006;
            posArray[ix] += Math.sin(elapsed * sway[i] + phases[i]) * 0.0015;

            if (posArray[ix + 1] > bounds.yTop) {
              resetParticle(i, false);
              colorChanged = true;
            }
          }

          pos.needsUpdate = true;

          if (colorChanged) {
            color.needsUpdate = true;
          }

          currentX += (targetX - currentX) * 0.04;
          currentY += (targetY - currentY) * 0.04;

          camera.position.x = currentX;
          camera.position.y = currentY;
          camera.lookAt(0, 0, 0);
        }

        renderer.render(scene, camera);
      };

      tick();
    });
  }
}
