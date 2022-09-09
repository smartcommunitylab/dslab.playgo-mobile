import {
  ComponentRef,
  Directive,
  ElementRef,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ContentContentComponent } from './content-content.component';

@Directive({
  selector: '[appContent]',
})
export class ContentDirective implements OnInit {
  public contentContentComponent: ComponentRef<ContentContentComponent>;
  constructor(
    private appComponentReference: AppComponent,
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    const contentTemplate =
      this.appComponentReference.contentTemplateComponent.template;

    this.contentContentComponent = this.viewContainerRef.createComponent(
      ContentContentComponent
    );

    const context = {};

    const templateView = this.viewContainerRef.createEmbeddedView(
      contentTemplate,
      context
    );

    const rootNodes = templateView.rootNodes || [];

    const host = this.element.nativeElement;
    const firstChild = host.firstChild;

    rootNodes.forEach((rootNode) => {
      host.insertBefore(rootNode, firstChild);
    });
  }
}
