import { Component, ElementRef, OnInit } from '@angular/core';
import { PushNotificationSchema } from '@capacitor/push-notifications';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-notification.modal',
  templateUrl: './notification.modal.html',
  styleUrls: ['./notification.modal.scss'],
})
export class NotificationModalPage implements OnInit {
  notification: PushNotificationSchema;
  public anchors: any;

  constructor(private modalController: ModalController,
    private elementRef: ElementRef
  ) { }
  ngOnInit() { }
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
  close() {
    this.modalController.dismiss(false);
  }
}
