import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { Notification } from '../../../api/generated/model/notification';
import {
  catchError,
  EMPTY,
  interval,
  map,
  mapTo,
  merge,
  NEVER,
  Observable,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { CommunicationAccountControllerService } from 'src/app/core/api/generated/controllers/communicationAccountController.service';
import { ErrorService } from '../error.service';
import { DateTime } from 'luxon';
import { PushNotificationService } from './pushNotification.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private since = 0;
  private storage =
    this.localStorageService.getStorageOf<Notification[]>('notifications');

  private afterSyncTimer$: Observable<void> = interval(60000).pipe(
    map(undefined)
  );
  private appResumed$: Observable<void> = NEVER;
  private networkStatusChanged$: Observable<void> = NEVER;
  private pushNotification$: Observable<void> =
    this.pushNotificationService.notifications$;

  private trigger$: Observable<void> = merge(
    this.afterSyncTimer$,
    this.appResumed$,
    this.networkStatusChanged$,
    this.pushNotification$
  ).pipe(throttleTime(500));

  public allNotifications$ = this.trigger$.pipe(
    switchMap(() =>
      this.communicationAccountController
        .getPlayerNotificationsUsingGET({ since: this.since })
        .pipe(this.errorService.getErrorHandler('silent'))
    ),
    map((serverNotifications) => serverNotifications.content),
    tap(
      (serverNotifications) =>
        (this.since =
          serverNotifications[serverNotifications.length - 1].timestamp)
    ),
    map((serverNotifications) => [
      ...this.storage.get(),
      ...serverNotifications,
    ]),
    tap((allNotifications) =>
      this.storage.set(
        allNotifications.filter(
          (notification) =>
            notification.timestamp >
            DateTime.local().minus({ month: 1 }).valueOf()
        )
      )
    )
  );
  constructor(
    private localStorageService: LocalStorageService,
    private errorService: ErrorService,
    private communicationAccountController: CommunicationAccountControllerService,
    private pushNotificationService: PushNotificationService
  ) {
    this.allNotifications$.subscribe((notifications) => {
      if (notifications === null) {
        this.storage.set([]);
      }
    });
  }
}
