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
import { firstValueFrom, map, Observable, Subscription, tap } from 'rxjs';
import { AppStatusService } from '../../services/app-status.service';
import { NotificationService } from '../../services/notifications/notifications.service';
import { Notification } from '../../../api/generated/model/notification';
import { PageSettingsService } from '../../services/page-settings.service';
@Component({
  selector: 'app-header-content',
  templateUrl: './header-content.component.html',
  styleUrls: ['./header-content.component.scss'],
})
export class HeaderContentComponent implements OnInit, OnDestroy {
  public title$ = this.pageSettingsService.pageSettings$.pipe(
    map((settings) => settings.title)
  );
  public backButton$ = this.pageSettingsService.pageSettings$.pipe(
    map((settings) => settings.backButton)
  );

  public color$ = this.pageSettingsService.pageSettings$.pipe(
    map((settings) => settings.color)
  );

  public defaultHref$ = this.pageSettingsService.pageSettings$.pipe(
    map((settings) => settings.defaultHref)
  );

  public showNotifications$ = this.pageSettingsService.pageSettings$.pipe(
    map((settings) => settings.showNotifications)
  );

  isOnline$: Observable<boolean> = this.appStatusService.isOnline$;
  numberOfNotification = 0;
  unreadNotification$: Observable<Notification[]> =
    this.notificationService.unreadAnnouncementNotifications$.pipe(
      tap((notifications) => {
        this.numberOfNotification = notifications.length;
        // this.cdRef.detectChanges();
      })
    );
  subunread: Subscription;

  constructor(
    private navCtrl: NavController,
    private appStatusService: AppStatusService,
    private router: Router,
    private notificationService: NotificationService,
    public pageSettingsService: PageSettingsService
  ) {}
  ngOnDestroy(): void {
    this.subunread.unsubscribe();
  }

  ngOnInit() {
    this.subunread = this.unreadNotification$.subscribe();
  }
  navigateToNotification() {
    this.router.navigateByUrl('/pages/notifications');
  }
  async back() {
    const defaultHref = (await this.getCurrentSettings()).defaultHref;
    if (defaultHref) {
      return this.navCtrl.navigateRoot(defaultHref);
    }
    return this.navCtrl.back();
  }

  async getCurrentSettings() {
    return await firstValueFrom(this.pageSettingsService.pageSettings$);
  }
}
