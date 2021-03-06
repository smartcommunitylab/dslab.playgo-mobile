import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { Notification } from '../../../api/generated/model/notification';
import {
  catchError,
  EMPTY,
  filter,
  interval,
  map,
  mapTo,
  merge,
  NEVER,
  Observable,
  share,
  shareReplay,
  Subject,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { tapLog } from '../../utils';
import { CommunicationAccountControllerService } from 'src/app/core/api/generated/controllers/communicationAccountController.service';
import { ErrorService } from '../error.service';
import { DateTime } from 'luxon';
import { PushNotificationService } from './pushNotification.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSinceStorage =
    this.localStorageService.getStorageOf<number>('notificationSince');
  private since = this.notificationSinceStorage.get() || 0;
  private notificationStorage =
    this.localStorageService.getStorageOf<Notification[]>('notifications');
  private appResumed$: Observable<void> = NEVER;
  private networkStatusChanged$: Observable<void> = NEVER;
  private notificationReaded$ = new Subject<void>();
  private pushNotification$: Observable<void> =
    this.pushNotificationService.notifications$;

  private trigger$: Observable<void> = merge(
    // this.afterSyncTimer$,
    this.authService.isReadyForApi$,
    this.appResumed$,
    this.networkStatusChanged$,
    this.pushNotification$,
    this.notificationReaded$
  ).pipe(throttleTime(500));

  public allNotifications$: Observable<Notification[]> = this.trigger$.pipe(
    switchMap(() =>
      this.communicationAccountController
        .getPlayerNotificationsUsingGET({ since: this.since })
        .pipe(this.errorService.getErrorHandler('silent'))
    ),
    // tapLog('got notifications'),
    tap((serverNotifications) => {
      if (serverNotifications.length > 0) {
        this.since =
          serverNotifications[0].timestamp -
          DateTime.local().minus({ hour: 1 }).valueOf();
        if (this.since < 0) {
          this.since = 0;
        }
        this.notificationSinceStorage.set(this.since);
      }
    }),
    map((serverNotifications) => [
      ...(this.notificationStorage.get() || []), //merge and eliminate duplicate based on id
      ...serverNotifications,
    ]),
    map((allNotifications) =>
      allNotifications.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      )
    ),
    tap<Notification[]>((allNotificationsWithoutDuplicates) =>
      this.notificationStorage.set(
        allNotificationsWithoutDuplicates
          .filter(
            (notification: Notification) =>
              notification.timestamp >
              DateTime.local().minus({ month: 1 }).valueOf()
          )
          .slice(0, MAX_NOTIFICATIONS)
      )
    ),
    shareReplay(1)
  );
  public unreadNotifications$ = this.allNotifications$.pipe(
    map((notifications) => notifications.filter((not) => not.readed === false)),
    shareReplay(1)
  );
  public readedNotifications$ = this.allNotifications$.pipe(
    map((notifications) => notifications.filter((not) => not.readed === true)),
    shareReplay(1)
  );

  public unreadAnnouncementNotifications$: Observable<Notification[]> =
    this.allNotifications$.pipe(
      map((notifications) =>
        notifications.filter((not) => not.readed === false)
      ),
      map((notifications) =>
        notifications.filter(
          (notification) =>
            notification.content.type === NotificationType.announcement
        )
      ),
      tapLog('unreadAnnouncements'),
      shareReplay(1)
    );
  public readedAnnouncementNotifications$: Observable<Notification[]> =
    this.allNotifications$.pipe(
      map((notifications) =>
        notifications.filter((not) => not.readed === true)
      ),

      map((notifications) =>
        notifications.filter(
          (notification) =>
            notification.content.type === NotificationType.announcement
        )
      ),
      shareReplay(1)
    );

  constructor(
    private localStorageService: LocalStorageService,
    private errorService: ErrorService,
    private authService: AuthService,
    private communicationAccountController: CommunicationAccountControllerService,
    private pushNotificationService: PushNotificationService
  ) {
    this.authService.isReadyForApi$.subscribe(() => {
      this.allNotifications$.subscribe((notifications) => {
        if (notifications === null) {
          this.notificationStorage.set([]);
        }
      });
    });
  }
  initPush() {
    this.pushNotificationService.initPush();
  }
  public getCampaignNotifications(
    campaignId: string
  ): Observable<Notification[]> {
    return this.allNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) =>
            notification.campaignId === campaignId &&
            NOTIFICATION_TYPE_ACTIONS.campaignWidgetBadge.types.includes(
              notification.content.type
            )
        )
      )
    );
  }
  public getUnreadCampaignChallengeNotifications(
    campaignId: string
  ): Observable<Notification[]> {
    return this.unreadNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) =>
            notification.campaignId === campaignId &&
            NOTIFICATION_TYPE_ACTIONS.campaignWidgetChallengeBadge.types.includes(
              notification.content.type
            )
        )
      )
    );
  }
  public getUnreadChallengeNotifications(): Observable<Notification[]> {
    return this.unreadNotifications$.pipe(
      map((notifications) =>
        notifications.filter((notification) =>
          NOTIFICATION_TYPE_ACTIONS.challengeTabBadge.types.includes(
            notification.content.type
          )
        )
      )
    );
  }
  public getUnreadCampaignNotifications(
    campaignId: string
  ): Observable<Notification[]> {
    return this.unreadNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) =>
            notification.campaignId === campaignId &&
            NOTIFICATION_TYPE_ACTIONS.campaignWidgetBadge.types.includes(
              notification.content.type
            )
        )
      )
    );
  }

  public getAnnouncementNotifications(): Observable<Notification[]> {
    return this.allNotifications$.pipe(
      map((notifications) =>
        notifications.filter((notification) =>
          NOTIFICATION_TYPE_ACTIONS.notificationBadge.types.includes(
            notification.content.type
          )
        )
      )
    );
  }

  public markAnnouncmentAsReaded() {
    const storedNotifications = this.notificationStorage.get();
    storedNotifications.forEach((notification) => {
      if (notification.content.type === NotificationType.announcement) {
        this.markSingleNotificationAsRead(storedNotifications, notification);
      }
    });
    this.notificationStorage.set(storedNotifications);
    //notify the new list of notifications
    this.notificationReaded$.next();
  }
  public markListOfNotificationAsRead(notifications: Notification[]) {
    const storedNotifications = this.notificationStorage.get();
    notifications.forEach((notification) => {
      this.markSingleNotificationAsRead(storedNotifications, notification);
    });
    this.notificationStorage.set(storedNotifications);
    //notify the new list of notifications
    this.notificationReaded$.next();
  }
  private markSingleNotificationAsRead(
    storedNotifications: Notification[],
    notification: Notification
  ): void {
    for (const not of storedNotifications) {
      if (not.id === notification.id) {
        not.readed = true;
        break;
      }
    }
  }
}
export const MAX_NOTIFICATIONS = 500 as const;
export enum NotificationType {
  level = 'level',
  badge = 'badge',
  programChallenge = 'program_challenge',
  newInvite = 'new_invite',
  replyAccepted = 'reply_accepted',
  replyDenied = 'reply_denied',
  challengeCancel = 'challenge_cancel',
  challengeAssigned = 'challenge_assigned',
  challengeComplete = 'challenge_complete',
  challengeFailed = 'challenge_failed',
  announcement = 'announcement',
}
export const NOTIFICATION_TYPE_ACTIONS = {
  campaignWidgetBadge: {
    types: [NotificationType.level],
  },
  challengeTabBadge: {
    types: [
      NotificationType.programChallenge,
      NotificationType.newInvite,
      NotificationType.replyAccepted,
      NotificationType.replyDenied,
      NotificationType.challengeCancel,
      NotificationType.challengeAssigned,
      NotificationType.challengeComplete,
      NotificationType.challengeFailed,
    ],
  },
  campaignWidgetChallengeBadge: {
    types: [
      NotificationType.programChallenge,
      NotificationType.newInvite,
      NotificationType.replyAccepted,
      NotificationType.replyDenied,
      NotificationType.challengeCancel,
      NotificationType.challengeAssigned,
      NotificationType.challengeComplete,
      NotificationType.challengeFailed,
    ],
  },

  notificationBadge: {
    types: [NotificationType.announcement],
  },
};
