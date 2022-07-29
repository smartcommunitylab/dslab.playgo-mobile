import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, Subscription, tap } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';
import { ErrorService } from '../../../services/error.service';
import { NotificationService } from '../../../services/notifications/notifications.service';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';
import { toServerDateOnly } from '../../../time.utils';
import { isOfflineError } from '../../../utils';
import { Notification } from '../../../../api/generated/model/notification';

@Component({
  selector: 'app-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.scss'],
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  unreadNotification$: Observable<Notification[]>;
  numberOfNotification = 0;
  subUnread: Subscription;

  constructor(
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.unreadNotification$ = this.notificationService
      .getUnreadCampaignNotifications(
        this.campaignContainer.campaign.campaignId
      )
      .pipe(
        tap((notifications) => {
          console.log('unread campaign notification', notifications);
          this.numberOfNotification = notifications.length;
          this.cdRef.detectChanges();
        })
      );
    this.subUnread = this.unreadNotification$.subscribe();
  }

  ngOnDestroy() {
    this.subUnread.unsubscribe();
  }
}
