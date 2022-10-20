import { Directive, ElementRef, OnInit, ViewContainerRef } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

/**
 * Ionic does not support extending behavior of ion-content component globally.
 * To avoid adding the same code to every page, we use a directive to add it automatically.
 *
 * Main use case is to add a ion-refresher to the ion-content. Easy way to add
 * content dynamically in directive is to add whole component (as we did in appHeader).
 * Unfortunately in this case it was not possible because ior-refresher expects
 * to be a direct child of ion-content. So we need to add just "template".
 * This is possible but we need another component somewhere, which will export
 * template using ViewChild of "<ng-template #template>..". This is the reason why
 * we have ContentContentComponent, which is just a wrapper for template and
 * is always present in the DOM (appComponent).
 *
 *
 * Directive to add the content component to the DOM
 */
@Directive({
  selector: '[appContent]',
})
export class ContentDirective implements OnInit {
  constructor(
    // We can ask dependency injection to give us this component
    private appComponentReference: AppComponent,
    // this is reference to element on which appContent is. (again DI will get it)
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    // get reference to contentTemplateComponent which is in appComponent template
    // using ViewChild in AppComponent
    const contentTemplateComponent =
      this.appComponentReference.contentTemplateComponent;

    // get reference to ng-template in ContentContentComponent (using ViewChild
    // in ContentContentComponent). This ng-template contains the content which we want to add.
    // this is just ng-template, so content is not rendered yet.
    const contentTemplate = contentTemplateComponent.template;

    // prepare context for the ng-template if needed (we don't need it here)
    const context = {};

    // instantiate the ng-template content.
    // (think about how ngFor works... in ngFor we will run next step for every item in the list)
    const templateView = this.viewContainerRef.createEmbeddedView(
      contentTemplate,
      context
    );

    // add content of template directly to the component which have appContent
    // directive (ion-content)
    const rootNodes = templateView.rootNodes || [];

    const host = this.element.nativeElement;
    const firstChild = host.firstChild;

    rootNodes.forEach((rootNode) => {
      host.insertBefore(rootNode, firstChild);
    });
  }
}
