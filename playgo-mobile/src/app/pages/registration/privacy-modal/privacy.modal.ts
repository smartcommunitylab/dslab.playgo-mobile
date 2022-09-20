import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

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
  ) {}
  ngAfterViewInit() {
    //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick);
    });
  }
  public handleAnchorClick = (event: Event) => {
    // Prevent opening anchors the default way
    event.preventDefault();
    const anchor = event.target as HTMLAnchorElement;
    Browser.open({
      url: anchor.href,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  };
  ngOnInit() {}
  close() {
    this.modalController.dismiss(false);
  }
}
