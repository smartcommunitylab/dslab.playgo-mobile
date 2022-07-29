import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { map, Observable, Subscription, tap } from 'rxjs';
import { AppStatusService } from '../../services/app-status.service';
import { NotificationService } from '../../services/notifications/notifications.service';
import { Notification } from '../../../api/generated/model/notification';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title: string;
  @Input() backButton = true;
  @Input() color = 'playgo';
  @Input() defaultHref = '/';
  @Input() showNotifications = false;

  isOnline$: Observable<boolean> = this.appStatusService.isOnline$;
  numberOfNotification = 0;
  unreadNotification$: Observable<Notification[]> =
    this.notificationService.unreadAnnouncementNotifications$.pipe(
      tap((notifications) => {
        this.numberOfNotification = notifications.length;
        this.cdRef.detectChanges();
      })
    );
  subunread: Subscription;
  constructor(
    private navCtrl: NavController,
    private appStatusService: AppStatusService,
    private router: Router,
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.isOnline$.subscribe((isOnline) => {
      console.log('isOnline', isOnline);
    });
  }
  ngOnDestroy(): void {
    this.subunread.unsubscribe();
  }

  ngOnInit() {
    this.subunread = this.unreadNotification$.subscribe();
  }
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
