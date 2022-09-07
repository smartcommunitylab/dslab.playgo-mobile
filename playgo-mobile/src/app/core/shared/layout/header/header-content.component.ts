import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButtons,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { firstValueFrom, map, Observable, Subscription, tap } from 'rxjs';
import { AppStatusService } from '../../services/app-status.service';
import { NotificationService } from '../../services/notifications/notifications.service';
import { Notification } from '../../../api/generated/model/notification';
import { PageSettingsService } from '../../services/page-settings.service';
@Component({
  selector: 'app-header-content',
  templateUrl: './header-content.component.html',
  styleUrls: ['./header-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderContentComponent implements OnInit, OnDestroy {
  @ViewChild(IonTitle, { static: false })
  public ionTitle: IonTitle & {
    el: HTMLIonTitleElement;
  };
  @ViewChild(IonToolbar, { static: false })
  public ionToolbar: IonToolbar & {
    el: HTMLIonToolbarElement;
  };
  @ViewChildren(IonButtons)
  public ionButtons: QueryList<IonButtons & { el: HTMLElement }>;

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
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    public pageSettingsService: PageSettingsService
  ) {}
  ngOnDestroy(): void {
    this.subunread.unsubscribe();
  }

  async ngOnInit() {
    this.subunread = this.unreadNotification$.subscribe();
  }
  navigateToNotification() {
    this.router.navigateByUrl('/pages/notifications');
  }

  async getCurrentSettings() {
    return await firstValueFrom(this.pageSettingsService.pageSettings$);
  }
}
