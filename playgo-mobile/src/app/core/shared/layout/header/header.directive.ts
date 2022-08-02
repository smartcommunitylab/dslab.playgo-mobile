import { Directive, ElementRef, OnInit, ViewContainerRef } from '@angular/core';
import { HeaderContentComponent } from './header-content.component';

@Directive({
  selector: '[appHeader]',
})
export class HeaderDirective implements OnInit {
  constructor(
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    const componentRef = this.viewContainerRef.createComponent(
      HeaderContentComponent
    );

    // const host = this.element.nativeElement;
    // host.insertBefore(componentRef.location.nativeElement, host.firstChild);
  }
}
