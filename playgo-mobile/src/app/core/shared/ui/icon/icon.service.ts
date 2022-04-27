import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  svgIcons: Record<string, string> = {};

  constructor(private domSanitizer: DomSanitizer) {}

  registerSvgIcons(svgIcons: Record<string, string>) {
    this.svgIcons = svgIcons;
  }

  isIconSvg(iconName: string) {
    return this.svgIcons[iconName] !== undefined;
  }
  getSvgSrc(iconName: string) {
    return this.svgIcons[iconName];
  }
}
