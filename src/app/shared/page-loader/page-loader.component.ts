import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import gsap from "gsap";

@Component({
  selector: "app-page-loader",
  standalone: true,
  template: `<div class="loader" role="status" aria-label="Opening portfolio">
    <video
      #video
      src="videos/Video%20Logo.mp4"
      muted
      playsinline
      preload="auto"
      aria-hidden="true"
      (timeupdate)="updateProgress()"
      (ended)="finish()"
      (error)="finish()"
    ></video>
    <div class="noise-overlay loader-noise" aria-hidden="true"></div>
    <div
      class="loading-progress"
      role="progressbar"
      aria-label="Opening animation"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="percentage"
    >
      <span class="loading-label">Loading</span>
      <span class="loading-value"
        >{{ percentage }}<span class="percent">%</span></span
      >
      <span class="loading-track" aria-hidden="true"
        ><span [style.transform]="'scaleX(' + percentage / 100 + ')'"></span
      ></span>
    </div>
  </div>`,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 10000;
      }
      .loader {
        --loader-columns: 8;
        position: absolute;
        inset: 0;
        background: #000;
        display: grid;
        place-items: center;
      }
      .loader::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background-image: linear-gradient(
          to left,
          rgba(255, 255, 255, 0.04) 1px,
          transparent 1px
        );
        background-size: calc(100% / var(--loader-columns)) 100%;
      }
      @media (max-width: 767px) {
        .loader {
          --loader-columns: 4;
        }
      }
      video {
        width: 100%;
        height: 100%;
        max-height: 100svh;
        object-fit: contain;
        mask-image: linear-gradient(
          90deg,
          transparent,
          #000 5%,
          #000 95%,
          transparent
        );
      }
      .loading-progress {
        position: absolute;
        z-index: 2;
        bottom: max(24px, env(safe-area-inset-bottom));
        right: max(24px, env(safe-area-inset-right));
        width: 132px;
        color: #fff;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: baseline;
        gap: 12px;
      }
      .loader-noise {
        position: absolute;
        z-index: 1;
      }
      .loading-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #ffffff99;
      }
      .loading-value {
        font-family: var(--font-heading);
        font-size: 26px;
        font-variant-numeric: tabular-nums;
      }
      .percent {
        color: var(--color-accent-1);
        font-size: 16px;
      }
      .loading-track {
        grid-column: 1 / -1;
        height: 2px;
        background: #ffffff25;
        overflow: hidden;
      }
      .loading-track > span {
        display: block;
        height: 100%;
        background: var(--color-accent-1);
        transform-origin: left;
        transition: transform 200ms linear;
      }
      @media (prefers-reduced-motion: reduce) {
        .loader {
          transition: none;
        }
      }
    `,
  ],
})
export class PageLoaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild("video", { static: true }) video!: ElementRef<HTMLVideoElement>;
  @Output() completed = new EventEmitter<void>();
  leaving = false;
  percentage = 0;
  private exitTimeline?: gsap.core.Timeline;
  private timeout?: ReturnType<typeof setTimeout>;
  private fade?: ReturnType<typeof setTimeout>;
  private previousOverflow = "";
  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
  ) {}
  ngAfterViewInit(): void {
    this.previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    this.timeout = setTimeout(() => this.finish(), 10000);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.fade = setTimeout(() => this.finish(), 0);
      return;
    }
    this.video.nativeElement.muted = true;
    this.video.nativeElement.playbackRate = 2;
    this.video.nativeElement.play().catch(() => this.finish());
  }
  updateProgress(): void {
    if (this.leaving) return;
    const video = this.video.nativeElement;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      this.percentage = Math.min(
        99,
        Math.floor((video.currentTime / video.duration) * 100),
      );
    }
  }
  finish(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.percentage = 100;
    clearTimeout(this.timeout);
    this.video.nativeElement.pause();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.fade = setTimeout(() => this.completed.emit(), 0);
      return;
    }
    const root = this.host.nativeElement;
    const loader = root.querySelector<HTMLElement>(".loader")!;
    // Clip the existing loader into columns, keeping a single video and surface.
    const columnCount =
      Number(
        getComputedStyle(loader).getPropertyValue("--loader-columns").trim(),
      ) || 8;
    // Keep borders and the reveal aligned if the viewport changes during exit.
    loader.style.setProperty("--loader-columns", String(columnCount));
    const columnWidth = 100 / columnCount;
    const columns = Array.from({ length: columnCount }, () => ({
      height: 100,
    }));
    const updateColumns = () => {
      const points = ["0% 0%", "100% 0%"];
      for (let index = columns.length - 1; index >= 0; index--) {
        const height = columns[index].height;
        points.push(
          `${(index + 1) * columnWidth}% ${height}%`,
          `${index * columnWidth}% ${height}%`,
        );
      }
      loader.style.clipPath = `polygon(${points.join(", ")})`;
    };
    this.exitTimeline = gsap.timeline({
      delay: 0.25,
      onComplete: () => this.zone.run(() => this.completed.emit()),
    });
    this.exitTimeline.to(columns, {
      height: 0,
      duration: 0.8,
      stagger: { amount: 0.45, from: "end" },
      ease: "sine.inOut",
      onUpdate: updateColumns,
    });
  }
  ngOnDestroy(): void {
    this.exitTimeline?.kill();
    clearTimeout(this.timeout);
    clearTimeout(this.fade);
    this.video.nativeElement.pause();
    document.documentElement.style.overflow = this.previousOverflow;
  }
}
