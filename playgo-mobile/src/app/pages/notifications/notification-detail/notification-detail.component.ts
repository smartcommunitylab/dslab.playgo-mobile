import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Notification } from 'src/app/core/api/generated/model/notification';
import { Browser } from '@capacitor/browser';
import { NotificationDetailModalPage } from './notification-modal/notification.modal';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';
@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationDetailComponent implements OnInit {
  @Input()
  notification: Notification;
  public anchors: any;

  constructor(
    public navController: NavController,
    public renderer: Renderer2,
    private elementRef: ElementRef,
    private modalController: ModalController,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // console.log(this.notification);
  }
  // ngAfterViewInit() {
  //   //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
  //   this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
  //   this.anchors.forEach((anchor: HTMLAnchorElement) => {
  //     anchor.addEventListener('click', this.handleAnchorClick);
  //   });
  // }
  async openNotification(notification: Notification) {
    const modal = await this.modalController.create({
      component: NotificationDetailModalPage,
      cssClass: 'modal-notification',
      componentProps: {
        notification,
      },
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    this.notificationService.markListOfNotificationAsRead([notification]);
  }
  // public handleAnchorClick = (event: Event) => {
  //   // Prevent opening anchors the default way
  //   event.preventDefault();
  //   const anchor = event.target as HTMLAnchorElement;
  //   Browser.open({
  //     url: anchor.href,
  //     windowName: '_system',
  //     presentationStyle: 'popover',
  //   });
  // };
}
