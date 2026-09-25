import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMotionComponent } from "../logo-motion/logo-motion.component";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [RouterLink, LogoMotionComponent],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild(LogoMotionComponent) private logo!: LogoMotionComponent;
  private mm?: gsap.MatchMedia;
  private initialized = false;
  private videoReady = false;
  private destroyed = false;
  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
  ) {}

  onVideoAvailable(ready: boolean): void {
    this.videoReady = ready;
    if (this.initialized && !this.destroyed) this.setup();
  }
  ngAfterViewInit(): void {
    this.initialized = true;
    this.setup();
  }

  private setup(): void {
    this.zone.runOutsideAngular(() => {
      this.mm?.revert();
      this.mm = gsap.matchMedia();
      const root = this.host.nativeElement;
      const section = root.querySelector<HTMLElement>("#about")!;
      const content = root.querySelector<HTMLElement>(".wrap")!;
      const portal = root.querySelector<HTMLElement>(".about-portal")!;
      const caption = root.querySelector<HTMLElement>(".portal-caption")!;
      const glow = root.querySelector<HTMLElement>(".portal-glow")!;
      const progress = root.querySelector<HTMLElement>(".about-progress")!;
      const bar = root.querySelector<HTMLElement>("#about-bar")!;
      const count = root.querySelector<HTMLElement>("#about-count")!;
      const photo = root.querySelector<HTMLElement>(".about-image")!;
      const cards = Array.from(
        root.querySelectorAll<HTMLElement>(".about-card"),
      );

      this.mm.add(
        {
          all: "(min-width: 0px)",
          desktop: "(min-width: 901px) and (min-height: 760px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const desktop = !!context.conditions?.["desktop"];
          const reduced = !!context.conditions?.["reduce"];
          const intro = this.videoReady && !reduced;
          section.classList.toggle("about-flow", !desktop || reduced);
          gsap.set(section, { backgroundColor: "#07090e", color: "#eeeeee" });
          gsap.set(root.querySelectorAll(".about-copy p"), {
            color: "rgba(238,238,238,.72)",
          });
          gsap.set(portal, { autoAlpha: intro ? 1 : 0 });
          gsap.set(caption, { autoAlpha: intro ? 1 : 0 });
          gsap.set(glow, { autoAlpha: 0 });
          gsap.set([content, progress], { autoAlpha: intro ? 0 : 1 });
          content.inert = intro;
          gsap.set(bar, { width: "0%" });
          count.textContent = "01/05";
          this.logo.setProgress(0);
          const state = { video: 0 };
          const syncAccess = () => {
            content.inert = Number(gsap.getProperty(content, "opacity")) < 0.5;
          };
          const timeline = gsap.timeline({
            scrollTrigger:
              intro || (desktop && !reduced)
                ? {
                    trigger: section,
                    start: "top top",
                    // Video readiness can recreate this trigger after downstream
                    // sections. Measure its pin space first on every refresh.
                    refreshPriority: 10,
                    end: () =>
                      `+=${window.innerHeight * (desktop ? (intro ? 6.5 : 4.5) : 1.8)}`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                  }
                : undefined,
            onUpdate: syncAccess,
          });
          if (intro) {
            timeline.to(
              state,
              {
                video: 1,
                duration: 2.4,
                ease: "none",
                onUpdate: () => this.logo.setProgress(state.video),
              },
              0,
            );
            timeline.to(caption, { autoAlpha: 0, duration: 0.35 }, 1.15);
            timeline.to(glow, { autoAlpha: 0.45, duration: 0.3 }, 1.6);
            timeline.to(portal, { autoAlpha: 0, duration: 0.65 }, 1.75);
            timeline.to(glow, { autoAlpha: 0, duration: 0.5 }, 1.95);
            timeline.fromTo(
              content,
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, duration: 0.7 },
              2.05,
            );
            timeline.to(progress, { autoAlpha: 1, duration: 0.4 }, 2.25);
          }
          if (desktop && !reduced) {
            gsap.set(cards, { autoAlpha: 0, y: 45 });
            gsap.set(photo, { opacity: 1, filter: "blur(0px)" });
            const cardStart = timeline.duration();
            timeline.to({}, { duration: 0.7 });
            timeline.to(photo, {
              opacity: 0.3,
              filter: "blur(8px)",
              duration: 0.5,
            });
            cards.forEach((card, index) => {
              if (index)
                timeline.to(cards[index - 1], {
                  autoAlpha: 0,
                  y: -30,
                  duration: 0.35,
                });
              timeline.to(card, { autoAlpha: 1, y: 0, duration: 0.55 });
              timeline.to({}, { duration: 0.75 });
            });
            timeline.eventCallback("onUpdate", () => {
              syncAccess();
              const value = gsap.utils.clamp(
                0,
                1,
                (timeline.time() - cardStart) /
                  (timeline.duration() - cardStart),
              );
              gsap.set(bar, { width: `${value * 100}%` });
              count.textContent = `${String(Math.min(5, Math.floor(value * 5) + 1)).padStart(2, "0")}/05`;
            });
          } else {
            gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
            gsap.set(photo, { opacity: 1, filter: "none", scale: 1 });
            gsap.set(progress, { display: "none" });
          }
          return () => {
            content.inert = false;
            section.classList.remove("about-flow");
          };
        },
        root,
      );
      ScrollTrigger.refresh();
    });
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.mm?.revert();
  }
}
