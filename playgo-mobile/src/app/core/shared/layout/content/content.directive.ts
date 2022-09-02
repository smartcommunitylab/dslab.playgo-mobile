import {
  ComponentRef,
  Directive,
  ElementRef,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { ContentContentComponent } from './content-content.component';

@Directive({
  selector: '[appContent]',
})
export class ContentDirective implements OnInit {
  public contentContentComponent: ComponentRef<ContentContentComponent>;
  constructor(
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.contentContentComponent = this.viewContainerRef.createComponent(
      ContentContentComponent
    );

    const host = this.element.nativeElement;
    host.insertBefore(
      this.contentContentComponent.location.nativeElement,
      host.firstChild
    );
  }
}
