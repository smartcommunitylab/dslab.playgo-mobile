import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  constructor(public loadingController: LoadingController) {}

  // Simple loader
  simpleLoader() {
    this.loadingController.create({}).then((response) => {
      response.present();
    });
  }
  // Dismiss loader
  dismissLoader() {
    this.loadingController
      .dismiss()
      .then((response) => {
        console.log('Loader closed!', response);
      })
      .catch((err) => {
        console.log('Error occured : ', err);
      });
  }
  // Timed hide show loader
  timedLoader(duration) {
    this.loadingController
      .create({
        duration,
      })
      .then((response) => {
        response.present();
        response.onDidDismiss().then(() => {
          console.log('Loader dismissed');
        });
      });
  }

  // Custom loader, cssClass
  customLoader(message, duration, cssClass) {
    this.loadingController
      .create({
        message,
        duration,
        cssClass,
        backdropDismiss: true,
      })
      .then((res) => {
        res.present();
      });
  }
}
