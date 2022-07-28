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

  // private afterSyncTimer$: Observable<void> = interval(500).pipe(
  //   mapTo(undefined)
  // );
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
    // tapLog('entering allNotifications$'),
    switchMap(() =>
      this.communicationAccountController
        .getPlayerNotificationsUsingGET({ since: this.since })
        .pipe(tapLog('notif'), this.errorService.getErrorHandler('silent'))
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
    // tapLog(`set since`, this.since),
    map((serverNotifications) => [
      ...(this.notificationStorage.get() || []), //merge and eliminate duplicate based on id
      ...serverNotifications,
    ]),
    // tapLog('allNotifications$'),
    map((allNotifications) =>
      allNotifications.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      )
    ),
    tapLog('allNotificationsWithoutDuplicates'),
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
    tapLog('unreadNotifications$')
  );
  public readedNotifications$ = this.allNotifications$.pipe(
    map((notifications) => notifications.filter((not) => not.readed === true)),
    tapLog('readedNotifications$')
  );

  constructor(
    private localStorageService: LocalStorageService,
    private errorService: ErrorService,
    private authService: AuthService,
    private communicationAccountController: CommunicationAccountControllerService,
    private pushNotificationService: PushNotificationService
  ) {
    console.log('NotificationService constructor');
    this.authService.isReadyForApi$.subscribe(() => {
      console.log('notification service is ready for api');
      this.allNotifications$.subscribe((notifications) => {
        console.log('notifications', notifications);
        if (notifications === null) {
          this.notificationStorage.set([]);
        }
      });
      this.unreadNotifications$.subscribe((notifications) => {
        console.log('Not read notifications', notifications);
      });
    });
  }
  initPush() {
    console.log('init push');
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
            notification.content.type !== 'announcement'
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
            notification.content.type !== 'announcement'
        )
      )
    );
  }
  public getAnnouncementNotifications(): Observable<Notification[]> {
    return this.allNotifications$.pipe(
      tapLog('entering getAnnouncementNotifications'),
      map((notifications) =>
        notifications.filter(
          (notification) => notification.content.type === 'announcement'
        )
      ),
      tapLog('getAnnouncementNotifications')
    );
  }
  public getUnreadAnnouncementNotifications(): Observable<Notification[]> {
    return this.unreadNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) => notification.content.type === 'announcement'
        )
      )
    );
  }
  public getReadedAnnouncementNotifications(): Observable<Notification[]> {
    return this.readedNotifications$.pipe(
      map((notifications) =>
        notifications.filter(
          (notification) => notification.content.type === 'announcement'
        )
      )
    );
  }
  public markAnnouncmentAsReaded() {
    const storedNotifications = this.notificationStorage.get();
    storedNotifications.forEach((notification) => {
      if (notification.content.type === 'announcement') {
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
