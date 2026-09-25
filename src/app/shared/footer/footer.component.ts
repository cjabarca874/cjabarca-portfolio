import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollService } from '../../core/scroll.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  backToTop(): void {
    this.scrollService.scrollTo(0);
  }

  private trigger?: ScrollTrigger;
  private tween?: gsap.core.Tween;

  constructor(private host: ElementRef<HTMLElement>, private scrollService: ScrollService) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const footer = this.host.nativeElement.querySelector('footer');
    if (!footer) {
      return;
    }

    this.tween = gsap.from(footer.querySelectorAll('.footer-reveal'), {
      y: 34,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footer,
        start: 'top 85%',
      },
    });

    this.trigger = this.tween.scrollTrigger;
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
    this.tween?.kill();
  }
}
