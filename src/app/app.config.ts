import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Fragment/scroll handling is managed by ScrollService,
      // so we keep Angular's own scroll restoration out of the way.
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled' }),
    ),
  ],
};
