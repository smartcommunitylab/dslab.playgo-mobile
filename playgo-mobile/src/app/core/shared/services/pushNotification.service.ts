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

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  notifications: PushNotificationSchema[] = [];

  constructor(
    private router: Router,
    private zone: NgZone,
    private platform: Platform
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

  //topic subscription
  subscribeTopic(topicName: string) {
    PushNotifications.register()
      .then(() => {
        FCM.subscribeTo({ topic: topicName })
          .then((r) => alert(`subscribed to topic ${topicName}`))
          .catch((err) => console.log(err));
      })
      .catch((err) => alert(JSON.stringify(err)));
  }
  //topic subscription
  unsubscribeTopic(topicName: string) {
    FCM.unsubscribeFrom({ topic: topicName })
      .then((r) => alert(`unsubscribed from topic ${topicName}`))
      .catch((err) => console.log(err));

    if (this.platform.is('android')) {
      FCM.deleteInstance();
    }
  }
}
