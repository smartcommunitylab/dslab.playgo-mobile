import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  ContentChild,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ViewChild,
  Optional,
} from '@angular/core';
import { IonToolbar, IonButtons, IonTitle } from '@ionic/angular';
import toPx from 'to-px';
import { HeaderContentComponent } from '../layout/header/header-content.component';
import { HeaderDirective } from '../layout/header/header.directive';
import { waitMs } from '../utils';
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ion-header[parallax]',
})
export class ParallaxDirective implements AfterContentInit {
  @Input() imageUrl: string;
  @Input() color: string;
  @Input() height: string | number = 300;
  @Input() bgPosition: 'top' | 'center' | 'bottom' = 'top';
  imageOverlay: HTMLElement;
  private toolbarBackground: HTMLElement;
  private innerScroll: HTMLElement;
  private originalToolbarHeight = 0;
  private ticking = false;
  private toolbarContainer: HTMLDivElement;
  @ContentChild(IonTitle, { static: false }) ionTitle: IonTitle & {
    el: HTMLIonTitleElement;
  };
  @ContentChild(IonToolbar, { static: false }) ionToolbar: IonToolbar & {
    el: HTMLIonToolbarElement;
  };
  @ContentChildren(IonButtons) ionButtons: QueryList<
    IonButtons & { el: HTMLElement }
  >;
  constructor(
    private headerRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Optional() private headerDirective: HeaderDirective
  ) {}

  ngAfterContentInit() {
    this.init();
  }
  private async init(numOfTry: number = 0) {
    try {
      if (this.initElements()) {
        this.setupContentPadding();
        this.setupImageOverlay();
        this.setupPointerEventsForButtons();
        this.setupEvents();
        this.updateProgress();
      }
    } catch (e) {
      if (numOfTry > 5) {
        console.log('parallax error', e);
      } else {
        await waitMs(100);
        await this.init(numOfTry + 1);
      }
    }
  }
  private get header() {
    return this.headerRef.nativeElement;
  }
  /**
   * Return the value of the input parameter `height` as a string with units.
   * If no units were provided, it will default to 'px'.
   */
  getMaxHeightWithUnits() {
    return !isNaN(+this.height) || typeof this.height === 'number'
      ? this.height + 'px'
      : this.height;
  }

  getMaxHeightInPx() {
    return toPx(this.getMaxHeightWithUnits());
  }

  private initElements() {
    if (this.headerDirective) {
      // If we are using [appHeader] directive, than @ContentChild will not resolve elements
      // so we need to get them from the HeaderContentComponent via @ViewChild
      const headerContentComponent =
        this.headerDirective.headerContentComponent.instance;

      this.ionToolbar = headerContentComponent.ionToolbar;
      this.ionTitle = headerContentComponent.ionTitle;
      this.ionButtons = headerContentComponent.ionButtons;
    }
    if (!this.ionToolbar) {
      console.error(
        'A <ion-toolbar> element is needed inside <ion-header> or using the [appHeader] directive on the <ion-header>'
      );
      return false;
    }

    const parentElement = this.header.parentElement;
    const ionContent = parentElement.querySelector('ion-content');

    if (!ionContent) {
      console.error('A <ion-content> element is needed');
      return false;
    }

    this.innerScroll = ionContent.shadowRoot.querySelector(
      '.inner-scroll'
    ) as HTMLElement;

    this.originalToolbarHeight = this.ionToolbar.el.offsetHeight;
    // console.log('this.originalToolbarHeight', this.originalToolbarHeight);
    // console.log(
    //   'this.ionToolbar.el.clientHeight',
    //   this.ionToolbar.el.clientHeight
    // );
    this.toolbarContainer =
      this.ionToolbar.el.shadowRoot.querySelector('.toolbar-container');

    this.toolbarBackground = this.ionToolbar.el.shadowRoot.querySelector(
      '.toolbar-background'
    );
    this.color =
      this.color ||
      window.getComputedStyle(this.toolbarBackground).backgroundColor;
    this.renderer.setStyle(this.toolbarContainer, 'align-items', 'baseline');
    return true;
  }

  private setupPointerEventsForButtons() {
    this.renderer.setStyle(this.header, 'pointer-events', 'none');
    this.ionToolbar.el
      .querySelectorAll('ion-buttons')
      .forEach((item) => this.renderer.setStyle(item, 'pointer-events', 'all'));
  }

  private setupContentPadding() {
    const parentElement = this.header.parentElement;
    const ionContent = parentElement.querySelector('ion-content');
    const mainContent = ionContent.shadowRoot.querySelector('main');
    const { paddingTop } = window.getComputedStyle(mainContent);
    const contentPaddingPx = toPx(paddingTop);
    const coverHeightPx = this.getMaxHeightInPx();
    this.renderer.setStyle(this.header, 'position', 'absolute');
    this.renderer.setStyle(
      this.innerScroll,
      'padding-top',
      `${contentPaddingPx + coverHeightPx}px`
    );
  }

  private setupImageOverlay() {
    this.imageOverlay = this.renderer.createElement('div');
    this.renderer.addClass(this.imageOverlay, 'image-overlay');

    this.renderer.setStyle(this.imageOverlay, 'background-color', this.color);

    this.renderer.setStyle(
      this.imageOverlay,
      'background-image',
      `url(${this.imageUrl || ''})`
    );

    this.renderer.setStyle(this.imageOverlay, 'height', `100%`);
    this.renderer.setStyle(this.imageOverlay, 'width', '100%');
    this.renderer.setStyle(this.imageOverlay, 'background-size', 'cover');
    this.renderer.setStyle(
      this.imageOverlay,
      'background-position',
      this.bgPosition
    );
    this.renderer.setStyle(
      this.imageOverlay,
      'box-shadow',
      'rgba(var(--ion-color-contrast-reversed-rgb),0.5) 1px 120px 60px -60px inset'
    );

    this.toolbarBackground.appendChild(this.imageOverlay);
  }

  private setupEvents() {
    this.innerScroll.addEventListener('scroll', (_event) => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateProgress();
          this.ticking = false;
        });
      }
      this.ticking = true;
    });
  }

  /** Update the parallax effect as per the current scroll of the ion-content */
  updateProgress() {
    const h = this.getMaxHeightInPx();
    const progress = this.calcProgress(this.innerScroll, h);
    this.progressLayerHeight(progress);
    this.progressLayerOpacity(progress);
  }

  progressLayerHeight(progress: number) {
    // console.log('progress', progress);
    const h = Math.max(
      this.getMaxHeightInPx() * (1 - progress),
      this.originalToolbarHeight
    );
    // console.log(
    //   'this.getMaxHeightInPx() * (1 - progress)',
    //   this.getMaxHeightInPx() * (1 - progress)
    // );

    // console.log('originalToolbarHeight', this.originalToolbarHeight);
    this.renderer.setStyle(this.toolbarContainer, 'height', `${h}px`);
    this.renderer.setStyle(this.imageOverlay, 'height', `100%`);
  }

  progressLayerOpacity(progress: number) {
    const op = 1 - progress;
    this.renderer.setStyle(this.imageOverlay, 'opacity', op);
    // this.renderer.setStyle(this.toolbarContainer, 'opacity', progress);
  }

  private calcProgress(scrollingElement: HTMLElement, maxHeight: number) {
    const scroll = +scrollingElement.scrollTop;
    const progress = Math.min(1, Math.max(0, scroll / maxHeight));
    return progress;
  }
}
