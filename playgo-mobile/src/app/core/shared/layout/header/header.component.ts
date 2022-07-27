import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AppStatusService } from '../../services/app-status.service';
import { NotificationService } from '../../services/notifications/notifications.service';
import { Notification } from '../../../api/generated/model/notification';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() backButton = true;
  @Input() color = 'playgo';
  @Input() defaultHref = '/';
  @Input() showNotifications = false;

  isOnline$: Observable<boolean> = this.appStatusService.isOnline$;
  unreadNotification$: Observable<Notification[]> =
    this.notificationService.getUnreadAnnouncementNotifications();
  constructor(
    private navCtrl: NavController,
    private appStatusService: AppStatusService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.isOnline$.subscribe((isOnline) => {
      console.log('isOnline', isOnline);
    });
  }

  ngOnInit() {}
  ngOnChanges() {
    console.log(this.title);
  }
  navigateToNotification() {
    this.router.navigateByUrl('/pages/notifications');
  }
  back() {
    if (this.defaultHref) {
      return this.navCtrl.navigateRoot(this.defaultHref);
    }
    return this.navCtrl.back();
  }
}
