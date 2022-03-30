import { Component, OnInit } from '@angular/core';
import { codePush } from 'capacitor-codepush';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit {
  constructor() {}

  ngOnInit() {
    //todo call profile service
  }

  async sync() {
    try {
      const res = await codePush.sync(
        {
          onSyncStatusChanged: (...args) => {
            console.log('onSyncStatusChanged:', args);
          },
        },
        (...args) => {
          console.log('Progress:', args);
        }
      );
      console.log('codePush.sync()', res);
      // alert(JSON.stringify(res));
    } catch (e) {
      console.error('codePush.sync()', e);
      // alert(e);
      throw e;
    }
  }
}

(window as any).codePush = codePush;
