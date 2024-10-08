import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { Notification } from '../../../api/generated/model/notification';
import {
  catchError,
  debounceTime,
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
import { CommunicationAccountControllerService } from 'src/app/core/api/generated/controllers/communicationAccountController.service';
import { ErrorService } from '../error.service';
import { DateTime } from 'luxon';
import { PushNotificationService } from './pushNotification.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { RefresherService } from '../refresher.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private since: number = null;
  private marked: boolean = false;
  private notificationStorage =
    this.localStorageService.getStorageOf<Notification[]>('notifications');
  private appResumed$: Observable<void> = NEVER;
  private networkStatusChanged$: Observable<void> = NEVER;
  private notificationRead$ = new Subject<void>();
  private pushNotification$: Observable<void> =
    this.pushNotificationService.notifications$;

  private trigger$: Observable<void> = merge(
    // this.afterSyncTimer$,
    this.authService.isReadyForApi$,
    this.appResumed$,
    this.networkStatusChanged$,
    this.pushNotification$,
    this.refresherService.refreshed$,
    this.notificationRead$
  ).pipe(throttleTime(500));

  public allNotifications$: Observable<Notification[]> = this.trigger$.pipe(
    // warning!! side effects!!!
    switchMap(async () => {
      if (this.since === null) {
        const notifications = await this.notificationStorage?.get();
        if (notifications && notifications.length > 0) {
          console.log(
            'DateTime.local().minus({ hour: 1 }).valueOf();' +
            DateTime.local().minus({ hour: 1 }).valueOf()
          );
          this.since = notifications[0]?.timestamp - 60 * 60 * 1000;
          console.log('since' + this.since);
        } else {
          this.since = 0;
          console.log('first time notifications');
        }
      }
      return this.since;
    }),
    switchMap((since) =>
      this.communicationAccountController
        .getPlayerNotificationsUsingGET({ since, limit: 100 })
        .pipe(this.errorService.getErrorHandler('silent'))
    ),
    switchMap(async (serverNotifications) => [
      ...((await this.notificationStorage.get()) || []),
      ...serverNotifications,
    ]),
    map((allNotifications) =>
      allNotifications.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      )
    ),
    tap<Notification[]>(async (allNotificationsWithoutDuplicates) => {
      await this.notificationStorage.set(
        allNotificationsWithoutDuplicates.slice(0, MAX_NOTIFICATIONS)
      );
      if (this.since === 0) {
        this.markAllNOtificationsAsRead();
      }
    }),
    debounceTime(2000),
    shareReplay(1)
  );
  public unreadNotifications$ = this.allNotifications$.pipe(
    map((notifications) => notifications.filter((not) => not.readed === false)),
    shareReplay(1)
  );
  public readNotifications$ = this.allNotifications$.pipe(
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
            !!notification.content &&
            notification.content.type === NotificationType.announcement
        )
      ),
      // tapLog('unreadAnnouncements'),
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
            !!notification.content &&
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
    private pushNotificationService: PushNotificationService,
    private refresherService: RefresherService

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
            !!notification.content &&
            NOTIFICATION_TYPE_ACTIONS.campaignWidgetBadge.types.includes(
              notification?.content?.type
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
            !!notification.content &&
            NOTIFICATION_TYPE_ACTIONS.campaignWidgetChallengeBadge.types.includes(
              notification?.content?.type
            )
        )
      )
    );
  }
  public getUnreadChallengeNotifications(): Observable<Notification[]> {
    return this.unreadNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) =>
            !!notification.content &&
            NOTIFICATION_TYPE_ACTIONS.challengeTabBadge.types.includes(
              notification?.content?.type
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
            !!notification.content &&
            NOTIFICATION_TYPE_ACTIONS.campaignWidgetBadge.types.includes(
              notification?.content?.type
            )
        )
      )
    );
  }

  public getAnnouncementNotifications(): Observable<Notification[]> {
    return this.allNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) =>
            !!notification.content &&
            NOTIFICATION_TYPE_ACTIONS.notificationBadge.types.includes(
              notification?.content?.type
            )
        )
      )
    );
  }
  public async markAllNOtificationsAsRead() {
    console.log('markAllNOtificationsAsRead');
    const storedNotifications = await this.notificationStorage.get();
    storedNotifications?.forEach((notification) => {
      this.markSingleNotificationAsRead(storedNotifications, notification);
    });
    this.notificationStorage.set(storedNotifications);
    //notify the new list of notifications
    if (!this.marked) {
      this.marked = true;
      this.notificationRead$.next();
    }
  }
  public async markAnnouncementAsRead() {
    console.log('markAnnouncementAsRead');
    const storedNotifications = await this.notificationStorage.get();
    storedNotifications?.forEach((notification) => {
      if (
        !!notification.content &&
        notification.content.type === NotificationType.announcement
      ) {
        this.markSingleNotificationAsRead(storedNotifications, notification);
      }
    });
    this.notificationStorage.set(storedNotifications);
    //notify the new list of notifications
    this.notificationRead$.next();
  }
  public async markCommonChallengeNotificationAsRead() {
    console.log('markCommonChallengeNotificationAsRead');
    const storedNotifications = await this.notificationStorage.get();
    storedNotifications.forEach((notification) => {
      if (
        !!notification.content &&
        NOTIFICATION_TYPE_ACTIONS.challengeTabBadge.types.indexOf(
          notification.content.type
        ) > -1
      ) {
        this.markSingleNotificationAsRead(storedNotifications, notification);
      }
    });
    this.notificationStorage.set(storedNotifications);
    //notify the new list of notifications
    this.notificationRead$.next();
  }
  public async markListOfNotificationAsRead(notifications: Notification[]) {
    console.log('markListOfNotificationAsRead');
    const storedNotifications = await this.notificationStorage.get();
    notifications.forEach((notification) => {
      this.markSingleNotificationAsRead(storedNotifications, notification);
    });
    this.notificationStorage.set(storedNotifications);
    //notify the new list of notifications
    this.notificationRead$.next();
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
  bonus = 'bonus'
}
export const NOTIFICATION_TYPE_ACTIONS = {
  campaignWidgetBadge: {
    types: [
      NotificationType.level,
      NotificationType.badge],
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
