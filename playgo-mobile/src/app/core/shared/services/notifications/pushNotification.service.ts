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
import { Platform } from '@ionic/angular';
import { CampaignService } from '../campaign.service';
import { UserService } from '../user.service';
import { tapLog } from '../../utils';
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
} from 'rxjs';
import { CommunicationAccountControllerService } from '../../../api/generated/controllers/communicationAccountController.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  sub: any;
  notifications: PushNotificationSchema[] = [];
  topicName: any;
  constructor(
    private zone: NgZone,
    private platform: Platform,
    private campaignService: CampaignService,
    private communicationAccountControllerservice: CommunicationAccountControllerService,
    private userService: UserService
  ) {}
  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }
  private async registerPush() {
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
      console.log('Push registration success, token: ' + token.value);
      //register on our server
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

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
        this.zone.run(() => {
          this.notifications.push(notification);
        });
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
  async registerToServer(token: string) {
    console.log('registerToServer', token);
    await this.communicationAccountControllerservice
      .registerUserToPushUsingPOST({
        platform: Capacitor.getPlatform(),
        registrationId: token,
      })
      .toPromise();
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
