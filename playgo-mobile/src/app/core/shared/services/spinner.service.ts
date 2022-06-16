import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private counter = 0;
  private isShowingLoader = false;
  private delay = 200;
  private isLoading = new Subject<boolean>();
  private loader: any;

  constructor(public loadingController: LoadingController) {
    this.isLoading.pipe(debounceTime(this.delay)).subscribe((value) => {
      if (value) {
        this.counter++;
        if (!this.isShowingLoader) {
          this.showLoader();
        }
      } else if (this.counter > 0) {
        this.counter--;
        if (this.isShowingLoader && this.counter === 0) {
          this.hideLoader();
        }
      }
    });
  }

  private async hideLoader() {
    if (this.loader) {
      this.loader.dismiss();
      this.loader = null;
      this.isShowingLoader = false;
    }
  }
  private async showLoader() {
    this.isShowingLoader = true;
    this.loader = await this.loadingController.create({
      duration: 10000,
    });
    return await this.loader.present();
  }

  public show() {
    this.isLoading.next(true);
  }
  public hide() {
    this.isLoading.next(false);
  }
}
