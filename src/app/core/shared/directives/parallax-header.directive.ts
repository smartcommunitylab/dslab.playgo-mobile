import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  ContentChild,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Optional,
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { IonToolbar, IonButtons, IonTitle, IonContent } from '@ionic/angular';
import toPx from 'to-px';
import { HeaderDirective } from '../layout/header/header.directive';
import { waitMs } from '../utils';

@Directive({
  selector: 'ion-header[parallax]',
  standalone: false
})
export class ParallaxDirective implements AfterContentInit {
  @Input() imageUrl: string;
  @Input() text: string;
  @Input() logo: SafeResourceUrl;
  @Input() color: string;
  @Input() height: string | number = 300;
  @Input() bgPosition: 'top' | 'center' | 'bottom' = 'top';

  imageOverlay: HTMLElement;
  textDateOverlay: HTMLElement;
  private toolbarBackground: HTMLElement;
  private innerScroll: HTMLElement;
  private originalToolbarHeight = 0;
  private ticking = false;
  private toolbarContainer: HTMLDivElement;
  private ionContent: IonContent;

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
  ) { }

  ngAfterContentInit() {
    this.init();
  }

  private async init(numOfTry: number = 0) {
    try {
      if (await this.initElements()) {
        this.setupContentPadding();
        this.setupImageOverlay();
        this.setupDate();
        this.setupPointerEventsForButtons();
        this.setupEvents();
        this.updateProgress();
      }
    } catch (e) {
      if (numOfTry > 5) {
        console.error('parallax error', e);
      } else {
        await waitMs(100);
        await this.init(numOfTry + 1);
      }
    }
  }

  private get header() {
    return this.headerRef.nativeElement;
  }

  getMaxHeightWithUnits() {
    return !isNaN(+this.height) || typeof this.height === 'number'
      ? this.height + 'px'
      : this.height;
  }

  getMaxHeightInPx() {
    return toPx(this.getMaxHeightWithUnits());
  }

  private async initElements() {
    if (this.headerDirective) {
      const headerContentComponent =
        this.headerDirective.headerContentComponent.instance;
      this.ionToolbar = headerContentComponent.ionToolbar;
      this.ionTitle = headerContentComponent.ionTitle;
      this.ionButtons = headerContentComponent.ionButtons;
    }

    if (!this.ionToolbar) {
      console.error(
        'A <ion-toolbar> element is needed inside <ion-header> or using the [appHeader] directive'
      );
      return false;
    }

    // Stili per il titolo
    if (this.ionTitle) {
      this.renderer.setStyle(this.ionTitle.el.firstChild,'margin-top',`calc(env(safe-area-inset-top) + 75px)` );
      this.renderer.setStyle(this.ionTitle.el.firstChild, 'overflow', 'hidden');
      this.renderer.setStyle(this.ionTitle.el.firstChild, 'white-space', 'normal');
      this.renderer.setStyle(this.ionTitle.el.firstChild, 'text-overflow', 'ellipsis');
      this.renderer.setStyle(this.ionTitle.el.firstChild, 'display', '-webkit-box');
      this.renderer.setStyle(this.ionTitle.el.firstChild, '-webkit-line-clamp', '2');
      this.renderer.setStyle(this.ionTitle.el.firstChild, '-webkit-box-orient', 'vertical');
    }

    // Stili per i bottoni - Ionic 8
    if (this.ionButtons?.first?.el) {
      const backButton = this.ionButtons.first.el.querySelector('ion-back-button');
      const button = this.ionButtons.first.el.querySelector('ion-button');

      if (backButton) {
        // Per ion-back-button, prova diversi selettori per trovare il button interno
        const backButtonShadow = backButton.shadowRoot?.querySelector('button') ||
          backButton.shadowRoot?.querySelector('.button-native') ||
          backButton.shadowRoot?.querySelector('[part="native"]');

        if (backButtonShadow) {
          this.renderer.setStyle(backButtonShadow, 'background-color', 'rgba(var(--ion-color-contrast-reversed-rgb), 0.5)');
          this.renderer.setStyle(backButtonShadow, 'border-radius', '50%');
          this.renderer.setStyle(backButtonShadow, 'width', '36px');
          this.renderer.setStyle(backButtonShadow, 'height', '36px');
          this.renderer.setStyle(backButtonShadow, 'min-width', '36px');
          this.renderer.setStyle(backButtonShadow, 'min-height', '36px');
        } else {
          console.warn('Cannot find back button shadow element. Available elements:',
            backButton.shadowRoot ? Array.from(backButton.shadowRoot.children).map(el => el.tagName) : 'No shadowRoot');
        }
        this.renderer.setStyle(backButton, 'width', '36px');
        this.renderer.setStyle(backButton, 'height', '36px');
      } else if (button) {
        // Per ion-button normale
        const buttonShadow = button.shadowRoot?.querySelector('button') ||
          button.shadowRoot?.querySelector('.button-native') ||
          button.shadowRoot?.querySelector('[part="native"]');

        if (buttonShadow) {
          this.renderer.setStyle(buttonShadow, 'background-color', 'rgba(var(--ion-color-contrast-reversed-rgb), 0.5)');
          this.renderer.setStyle(buttonShadow, 'border-radius', '50%');
          this.renderer.setStyle(buttonShadow, 'width', '36px');
          this.renderer.setStyle(buttonShadow, 'height', '36px');
        }
      }
    }

    const parentElement = this.header.parentElement;
    this.ionContent = parentElement.querySelector('ion-content') as any;

    if (!this.ionContent) {
      console.error('A <ion-content> element is needed');
      return false;
    }

    // IMPORTANTE: In Ionic 8, usa getScrollElement() invece di accedere al shadowRoot
    try {
      this.innerScroll = await this.ionContent.getScrollElement();
    } catch (e) {
      console.error('Cannot get scroll element', e);
      return false;
    }

    if (!this.innerScroll) {
      console.error('innerScroll is null');
      return false;
    }

    this.originalToolbarHeight = this.ionToolbar.el.offsetHeight;

    // Accesso al shadow DOM della toolbar - Ionic 8
    const toolbarShadowRoot = this.ionToolbar.el.shadowRoot;
    if (!toolbarShadowRoot) {
      console.error('Cannot access toolbar shadow root');
      return false;
    }

    // In Ionic 8, prova questi selettori
    this.toolbarContainer = toolbarShadowRoot.querySelector('.toolbar-container') as HTMLDivElement;
    this.toolbarBackground = toolbarShadowRoot.querySelector('.toolbar-background') as HTMLElement;

    // Fallback: se non trova .toolbar-background, prova altri selettori
    if (!this.toolbarBackground) {
      // Prova con il div principale
      this.toolbarBackground = toolbarShadowRoot.querySelector('div') as HTMLElement;
      console.warn('Using fallback for toolbar background');
    }

    if (!this.toolbarContainer) {
      // Crea un container se non esiste
      this.toolbarContainer = this.renderer.createElement('div');
      this.renderer.addClass(this.toolbarContainer, 'toolbar-container-custom');
      const firstChild = toolbarShadowRoot.firstElementChild;
      if (firstChild) {
        this.renderer.insertBefore(toolbarShadowRoot, this.toolbarContainer, firstChild);
        this.renderer.appendChild(this.toolbarContainer, firstChild);
      }
      console.warn('Created custom toolbar container');
    }

    if (!this.toolbarBackground) {
      console.error('Cannot find toolbar background element');
      return false;
    }

    // Imposta il colore
    this.color = this.color || window.getComputedStyle(this.toolbarBackground).backgroundColor;

    // Imposta l'allineamento del container
    if (this.toolbarContainer) {
      this.renderer.setStyle(this.toolbarContainer, 'align-items', 'baseline');
    }

    return true;
  }

  private setupPointerEventsForButtons() {
    this.renderer.setStyle(this.header, 'pointer-events', 'none');
    this.ionToolbar.el
      .querySelectorAll('ion-buttons')
      .forEach((item) => this.renderer.setStyle(item, 'pointer-events', 'all'));
  }

  private setupContentPadding() {
    const coverHeightPx = this.getMaxHeightInPx();
    this.renderer.setStyle(this.header, 'position', 'absolute');

    // In Ionic 8, imposta il padding direttamente sul content
    this.renderer.setStyle(
      this.innerScroll,
      'padding-top',
      `${coverHeightPx}px`
    );
  }

  private setupDate() {
    if (!this.text) return;

    this.textDateOverlay = this.renderer.createElement('div');
    this.textDateOverlay.innerHTML = this.text;
    this.renderer.addClass(this.textDateOverlay, 'text-overlay');
    this.renderer.setStyle(this.textDateOverlay, 'background-color', 'transparent');
    this.renderer.setStyle(this.textDateOverlay, 'text-align', 'center');
    this.renderer.setStyle(this.textDateOverlay, 'width', '100%');
    this.renderer.setStyle(this.textDateOverlay, 'position', 'absolute');

    const safeTop = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--ion-safe-area-top') || '0'
    );
    
    this.renderer.setStyle(
      this.textDateOverlay,
      'bottom',
      `calc(${safeTop}px + 16px)` 
    );
    // this.renderer.setStyle(this.textDateOverlay, 'bottom', '20%');
    this.renderer.setStyle(this.textDateOverlay, 'pointer-events', 'none');
    this.toolbarBackground.appendChild(this.textDateOverlay);
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
    this.renderer.setStyle(this.imageOverlay, 'height', '100%');
    this.renderer.setStyle(this.imageOverlay, 'width', '100%');
    this.renderer.setStyle(this.imageOverlay, 'position', 'absolute');
    this.renderer.setStyle(this.imageOverlay, 'top', '0');
    this.renderer.setStyle(this.imageOverlay, 'left', '0');
    this.renderer.setStyle(this.imageOverlay, 'background-size', 'cover');
    this.renderer.setStyle(this.imageOverlay, 'background-position', this.bgPosition);
    this.renderer.setStyle(
      this.imageOverlay,
      'box-shadow',
      'inset 0px -170px 102px -57px rgba(var(--ion-color-base-rgb),1), 4px 5px 15px 5px rgb(0 0 0 / 0%)'
    );
    this.renderer.setStyle(this.imageOverlay, 'pointer-events', 'none');

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

  updateProgress() {
    const h = this.getMaxHeightInPx();
    const progress = this.calcProgress(this.innerScroll, h);
    this.progressLayerHeight(progress);
    this.progressLayerOpacity(progress);
    this.progressLayerBackground(progress);
  }

  progressLayerHeight(progress: number) {
    const h = Math.max(
      this.getMaxHeightInPx() * (1 - progress),
      this.originalToolbarHeight
    );

    if (this.toolbarContainer) {
      this.renderer.setStyle(this.toolbarContainer, 'height', `${h}px`);
    }
    this.renderer.setStyle(this.ionToolbar.el, 'height', `${h}px`);
    this.renderer.setStyle(this.imageOverlay, 'height', '100%');
  }

  progressLayerOpacity(progress: number) {
    const op = 1 - progress;
    this.renderer.setStyle(this.imageOverlay, 'opacity', op);

    if (this.textDateOverlay) {
      this.renderer.setStyle(this.textDateOverlay, 'opacity', op);
    }

    if (this.ionTitle?.el?.firstChild) {
      this.renderer.setStyle(
        this.ionTitle.el.firstChild,
        'margin-top',
        `calc(env(safe-area-inset-top) + ${(1 - progress) * 75}px)`
      );
    }
  }

  progressLayerBackground(progress: number) {
    const op = Math.max(0, 0.5 - progress);

    if (this.ionButtons?.first?.el) {
      const backButton = this.ionButtons.first.el.querySelector('ion-back-button');
      const button = this.ionButtons.first.el.querySelector('ion-button');

      if (backButton) {
        const backButtonShadow = backButton.shadowRoot?.querySelector('button') ||
          backButton.shadowRoot?.querySelector('.button-native') ||
          backButton.shadowRoot?.querySelector('[part="native"]');
        if (backButtonShadow) {
          this.renderer.setStyle(
            backButtonShadow,
            'background-color',
            `rgba(var(--ion-color-contrast-reversed-rgb), ${op})`
          );
        }
      } else if (button) {
        const buttonShadow = button.shadowRoot?.querySelector('button') ||
          button.shadowRoot?.querySelector('.button-native') ||
          button.shadowRoot?.querySelector('[part="native"]');
        if (buttonShadow) {
          this.renderer.setStyle(
            buttonShadow,
            'background-color',
            `rgba(var(--ion-color-contrast-reversed-rgb), ${op})`
          );
        }
      }
    }
  }

  private calcProgress(scrollingElement: HTMLElement, maxHeight: number) {
    const scroll = +scrollingElement.scrollTop;
    const progress = Math.min(1, Math.max(0, scroll / maxHeight));
    return progress;
  }
}