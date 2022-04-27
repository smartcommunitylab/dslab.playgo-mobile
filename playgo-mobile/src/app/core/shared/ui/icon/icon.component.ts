import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IconService } from './icon.service';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent implements OnInit, OnChanges {
  @Input() name: string;

  isSvg: boolean;
  src: string;

  constructor(private iconService: IconService) {}

  ngOnChanges() {
    this.isSvg = this.iconService.isIconSvg(this.name);
    if (this.isSvg) {
      this.src = this.iconService.getSvgSrc(this.name);
    } else {
      this.src = null;
    }
  }

  ngOnInit() {}
}
