import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-boards', standalone: true,
  templateUrl: './brand-boards.component.html', styleUrl: './brand-boards.component.scss',
})
export class BrandBoardsComponent {
  boards = [
    { name: 'Aurum', image: 'images/Logo-1.jpg', mockup: 'images/brand-boards/aurum.png', descriptor: 'Smart Wealth Management', headingFont: 'Raleway', bodyFont: 'Arial', background: '#000000', foreground: '#FFFDF5', accent: '#003B70', colors: [
      { name: 'Electric blue', hex: '#008CFF' }, { name: 'Deep blue', hex: '#003B70' }, { name: 'Black', hex: '#000000' }, { name: 'Warm white', hex: '#FFFDF5' },
    ] },
    { name: 'College of Computer Education', image: 'images/Logo-2.jpg', mockup: 'images/brand-boards/college.png', descriptor: 'Andres Soriano Colleges of Bislig', headingFont: 'Arial', bodyFont: 'Raleway', background: '#FFFFFF', foreground: '#202020', accent: '#A93216', colors: [
      { name: 'Signal red', hex: '#FF2400' }, { name: 'Orange', hex: '#FF8500' }, { name: 'Silver', hex: '#D6D6D6' }, { name: 'White', hex: '#FFFFFF' },
    ] },
    { name: 'Shepherd International', image: 'images/Logo-3.jpg', mockup: 'images/brand-boards/shepherd.png', descriptor: 'Shepherd International', headingFont: 'Georgia', bodyFont: 'Arial', background: '#FCF0EB', foreground: '#24201E', accent: '#AF4300', colors: [
      { name: 'Sunset', hex: '#FF6500' }, { name: 'Aqua', hex: '#28B7CC' }, { name: 'Ink', hex: '#24201E' }, { name: 'Shell', hex: '#FCF0EB' },
    ] },
    { name: 'Hutshaven', image: 'images/Logo-4.jpg', mockup: 'images/brand-boards/hutshaven.png', descriptor: 'Hutshaven', headingFont: 'Arial', bodyFont: 'Raleway', background: '#FFFFFF', foreground: '#001E25', accent: '#001E25', colors: [
      { name: 'Deep teal', hex: '#001E25' }, { name: 'Charcoal', hex: '#202829' }, { name: 'Stone', hex: '#DDE3DF' }, { name: 'White', hex: '#FFFFFF' },
    ] },
  ];
}
