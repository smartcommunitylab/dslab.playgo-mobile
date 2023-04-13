import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { ModalController, Platform } from '@ionic/angular';
import { CampaignService } from '../campaign.service';
import { UserService } from '../user.service';
import { tapLog } from '../../rxjs.utils';
import { ErrorService } from '../error.service';
import {
  combineLatest,
  first,
  from,
  mergeMap,
  toArray,
  switchMap,
  merge,
  catchError,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { CommunicationAccountControllerService } from '../../../api/generated/controllers/communicationAccountController.service';
import { NotificationModalPage } from '../../notification-modal/notification.modal';
import { RefresherService } from '../refresher.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  sub: any;
  subUn: any;
  notifications: PushNotificationSchema[] = [];
  topicName: any;
  private notificationsSubject = new ReplaySubject<void>(1);

  public notifications$ = this.notificationsSubject.asObservable();
  modal: any;
  constructor(
    private zone: NgZone,
    private campaignService: CampaignService,
    private communicationAccountControllerService: CommunicationAccountControllerService,
    private userService: UserService,
    private modalController: ModalController,
    private errorService: ErrorService,
    private refresherService: RefresherService
  ) { }
  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
      this.campaignService.subscribeCampaignAction$.subscribe((topicName) => {
        this.userService.userProfileTerritory$
          .pipe(first(), tapLog('userProfileTerritory$'))
          .subscribe((profile) => {
            FCM.subscribeTo({ topic: `${profile.territoryId}-${topicName}` });
          });
      });
      this.campaignService.unsubscribeCampaignAction$.subscribe((topicName) => {
        this.userService.userProfileTerritory$
          .pipe(first(), tapLog('userProfileTerritory$'))
          .subscribe((profile) => {
            FCM.unsubscribeFrom({ topic: `${profile.territoryId}-${topicName}` });
          });
      });
    }
  }
  public async registerPush() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }
    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      this.zone.run(() => {
        FCM.getToken().then((fcmtoken) => {
          if (Capacitor.getPlatform() === 'ios') {
            console.log('fcmtoken', fcmtoken);
            this.registerToServer(fcmtoken.token);
          } else {
            this.registerToServer(token.value);
          }
          // subscribe to territory and all campaign I have
          this.registerToTopics();
        });
      });
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      this.zone.run(() => {
        console.log('Error on registration: ' + JSON.stringify(error));
      });
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.zone.run(() => {
          this.notificationsSubject.next();
          console.log('Push received: ' + JSON.stringify(notification));
          this.notifications.push(notification);
          this.showLastNotification(notification);
          this.refresherService.onRefresh(null);
        });
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        this.zone.run(() => {
          this.notifications.push(notification.notification);
          if (
            notification?.notification?.data?.title &&
            notification?.notification?.data?.description
          ) {
            this.showLastNotification(notification.notification);
          }
        });
      }
    );
  }
  async showLastNotification(notification: PushNotificationSchema) {
    //show last notification if received
    if (!this.modal) {
      this.modal = await this.modalController.create({
        component: NotificationModalPage,
        cssClass: 'modal-challenge',
        componentProps: {
          notification,
        },
        swipeToClose: true,
      });
      await this.modal.present();

      const { data } = await this.modal.onWillDismiss();
      this.modal = null;
    }
  }
  async registerToServer(token: string) {
    console.log('registerToServer', token);
    try {
      await this.communicationAccountControllerService
        .registerUserToPushUsingPOST({
          platform: Capacitor.getPlatform(),
          registrationId: token,
        })
        .toPromise();
    } catch (e) {
      this.errorService.handleError(e, 'silent');
    }
  }
  registerToTopics() {
    console.log('registerToTopics');
    this.sub = combineLatest([
      this.campaignService.myCampaigns$,
      this.userService.userProfileTerritory$,
    ])
      .pipe(
        first(),
        switchMap(([campaigns, profile]) =>
          merge(
            from(campaigns).pipe(
              tapLog('campaigns'),
              mergeMap((val) => {
                console.log(val);
                return FCM.subscribeTo({
                  topic: `${profile.territoryId}-${val?.campaign?.campaignId}`,
                });
              }),
              toArray()
            ),
            from(FCM.subscribeTo({ topic: profile?.territoryId }))
          )
        ),
        catchError((err) => {
          throw err;
        })
      )
      .subscribe();

  }

  unregisterToTopics() {
    console.log('unregisterToTopics');
    if (Capacitor.getPlatform() !== 'web') {
      this.subUn = combineLatest([
        this.campaignService.myCampaigns$,
        this.userService.userProfileTerritory$,
      ])
        .pipe(
          first(),
          switchMap(([campaigns, profile]) =>
            merge(
              from(campaigns).pipe(
                tapLog('campaigns'),
                mergeMap((val) => {
                  console.log(val);
                  return FCM.unsubscribeFrom({
                    topic: `${profile.territoryId}-${val?.campaign?.campaignId}`,
                  });
                }),
                toArray()
              ),
              from(FCM.unsubscribeFrom({ topic: profile?.territoryId }))
            )
          ),
          catchError((err) => {
            throw err;
          })
        )
        .subscribe();
    }
  }
}
