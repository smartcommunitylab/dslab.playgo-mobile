import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EMPTY, Observable, Subscription, tap } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { NotificationService } from '../../../services/notifications/notifications.service';
import { Notification } from '../../../../api/generated/model/notification';

@Component({
  selector: 'app-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.scss'],
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() type: TypeOfNotification;
  unreadNotification$: Observable<Notification[]>;
  numberOfNotification = 0;
  subUnread: Subscription;

  constructor(
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.unreadNotification$ = this.getNotifObservable(this.type).pipe(
      tap((notifications) => {
        // console.log('unread campaign notification', notifications);
        this.numberOfNotification = notifications.length;
        // this.cdRef.detectChanges();
      })
    );
    this.subUnread = this.unreadNotification$.subscribe();
  }
  getNotifObservable(type: TypeOfNotification) {
    switch (type) {
      case 'campaign':
        return this.notificationService.getUnreadCampaignNotifications(
          this.campaignContainer.campaign.campaignId
        );

      case 'challenge':
        return this.notificationService.getUnreadCampaignChallengeNotifications(
          this.campaignContainer.campaign.campaignId
        );
      default:
        return EMPTY;
    }
  }

  ngOnDestroy() {
    this.subUnread.unsubscribe();
  }
}
type TypeOfNotification = 'campaign' | 'challenge';
