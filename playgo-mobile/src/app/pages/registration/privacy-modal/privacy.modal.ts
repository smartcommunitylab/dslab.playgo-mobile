import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
import { Capacitor } from '@capacitor/core';

import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy.modal.html',
  styleUrls: ['./privacy.modal.scss'],
})
export class PrivacyModalPage implements OnInit, AfterViewInit {
  public anchors: any;

  constructor(
    private elementRef: ElementRef,
    private modalController: ModalController
  ) { }
  ngAfterViewInit() {
    //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick);
    });
  }
  public handleAnchorClick = async (event: Event) => {
    event.preventDefault();

    const anchor = event.currentTarget as HTMLAnchorElement;
    const href = anchor.href;

    if (!href) {
      console.warn('Anchor has no href.');
      return;
    }

    // Gestione dei mailto, tel, sms, ecc.
    if (
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('sms:')
    ) {
      if (Capacitor.isNativePlatform()) {
        await AppLauncher.openUrl({ url: href });
      } else {
        // fallback per web
        window.open(href, '_blank');
      }
      return;
    }

    // Altri link (http/https)
    try {
      await Browser.open({
        url: href,
        windowName: '_system',
        presentationStyle: 'popover',
      });
    } catch (err) {
      console.error('Browser.open failed', err);
    }
  };

  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
