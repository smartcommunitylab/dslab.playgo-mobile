import { Component } from '@angular/core';

// import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation';

@Component({
  selector: 'app-hello',
  templateUrl: 'hello.component.html',
  styleUrls: ['hello.component.css'],
})
export class HelloComponent {
  constructor() {
    this.start().then(() => console.log('OK'));
  }
  async start() {
    // const initialConfig = {};
    // const state = await BackgroundGeolocation.ready(initialConfig);
    // const currentLocation = await BackgroundGeolocation.getCurrentPosition({});
    // await BackgroundGeolocation.start();
  }
}
