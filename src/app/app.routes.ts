import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
    title: 'Abarca CJ — Web Designer & Developer',
  },
  {
    path: 'project/:slug',
    loadComponent: () =>
      import('./project/project.component').then((m) => m.ProjectComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
