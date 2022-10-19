import {
  ComponentRef,
  Directive,
  ElementRef,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { HeaderContentComponent } from './header-content.component';

/**
 * Ionic does not support extending behavior of ion-header component globally.
 * To avoid adding the same code to every page, we use a directive to add it automatically.
 *
 * We have special HeaderContentComponent which contains all content that we want to add
 * to the header (title, backButton....). This directive will add this component as
 * child of ion-header of every page.
 *
 * We tried also to have header component outside of router-outlet, but it was not
 * very good solution because it didn't play nice with ionic - which assumes some
 * page structure.
 *
 * One drawback of adding whole component is that there is not another component
 * between ion-header and ion-toolbar. This caused some problems in parallax
 * directive, so we had to change it a little.
 *
 * Note: Another approach would be to add just content of some template without
 * adding any component. We use this approach in ContentDirective, and it would
 * be possible to use it here too. And probably it would be better, but it is already working.
 *
 * Note 2: If there will be some delay in rendering of the header, then it is probably
 * caused by PageSettingsService, which sets data to the HeaderContentComponent.
 */
@Directive({
  selector: '[appHeader]',
})
export class HeaderDirective implements OnInit {
  public headerContentComponent: ComponentRef<HeaderContentComponent>;
  constructor(
    // target element on which we have directive. (ion-header)
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    // dynamically create element
    this.headerContentComponent = this.viewContainerRef.createComponent(
      HeaderContentComponent
    );

    // add it as child of ion-header
    const host = this.element.nativeElement;
    host.insertBefore(
      this.headerContentComponent.location.nativeElement,
      host.firstChild
    );
  }
}
