import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ScrollService } from './core/scroll.service';
import { NavComponent } from './shared/nav/nav.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private scrollService: ScrollService) {}

  ngOnInit(): void {
    this.scrollService.init();
  }
}
