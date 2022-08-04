import {
  ComponentRef,
  Directive,
  ElementRef,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { HeaderContentComponent } from './header-content.component';

@Directive({
  selector: '[appHeader]',
})
export class HeaderDirective implements OnInit {
  public headerContentComponent: ComponentRef<HeaderContentComponent>;
  constructor(
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.headerContentComponent = this.viewContainerRef.createComponent(
      HeaderContentComponent
    );

    const host = this.element.nativeElement;
    host.insertBefore(
      this.headerContentComponent.location.nativeElement,
      host.firstChild
    );
  }
}
