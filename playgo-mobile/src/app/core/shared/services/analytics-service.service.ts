import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

// Init for the web
import '@capacitor-community/firebase-analytics';

import { Plugins } from '@capacitor/core';
import { Device } from '@capacitor/device';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { FirebaseAnalytics } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsServiceService {
  analyticsEnabled = true;

  constructor(private router: Router) {
    this.initFb();
    this.router.events
      .pipe(
        map((e) => e as RouterEvent),
        filter((e: RouterEvent) => e instanceof NavigationEnd)
      )
      .subscribe((e: RouterEvent) => {
        console.log('route changed: ', e.url);
        this.setScreenName(e.url);
      });
  }

  async initFb() {
    if ((await Device.getInfo()).platform === 'web') {
      this.analyticsEnabled = false;
    }
  }

  setUser() {
    // Use Firebase Auth uid
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    FirebaseAnalytics.setUserId({
      userId: '123', //"test_123"+ timestamp.toString(),
    });
  }

  setProperty() {
    FirebaseAnalytics.setUserProperty({
      name: 'framework',
      value: 'angular',
    });
  }

  logEvent() {
    FirebaseAnalytics.logEvent({
      name: 'cutom_event',
      params: {
        casa: 'undici',
        method: 'email',
      },
    });
  }

  logNewEvent(event: string) {
    FirebaseAnalytics.logEvent({
      name: 'event_name_check_params',
      params: {
        event,
      },
    });
  }

  setScreenName(screenName: any) {
    FirebaseAnalytics.setScreenName({
      screenName,
    });
  }

  toggleAnalytics() {
    this.analyticsEnabled = !this.analyticsEnabled;
    FirebaseAnalytics.setCollectionEnabled({
      enabled: this.analyticsEnabled,
    });
  }
}
