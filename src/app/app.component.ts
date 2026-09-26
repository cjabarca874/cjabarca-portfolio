import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ScrollService } from './core/scroll.service';
import { NavComponent } from './shared/nav/nav.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CursorComponent } from './shared/cursor/cursor.component';
import { ScrollProgressComponent } from './shared/scroll-progress/scroll-progress.component';
import { PageLoaderComponent } from './shared/page-loader/page-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent, CursorComponent, ScrollProgressComponent, PageLoaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  loading = true;
  constructor(private scrollService: ScrollService) {}

  ngOnInit(): void {
    this.scrollService.init();
  }
}
