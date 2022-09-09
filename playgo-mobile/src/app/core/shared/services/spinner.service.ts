import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Observable, of, Subject } from 'rxjs';
import {
  auditTime,
  concatMap,
  distinctUntilChanged,
  map,
  scan,
  startWith,
} from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private delay = 200;
  private loader: HTMLIonLoadingElement;
  private loadingRequestedSubject = new Subject<boolean>();

  private notDebouncedLoading: Observable<boolean> =
    this.loadingRequestedSubject.pipe(
      map((isLoading) => (isLoading ? 1 : -1)),
      scan((counter, updateToCounter) => counter + updateToCounter, 0),
      map((count) => count > 0),
      startWith(false),
      distinctUntilChanged()
    );

  private debouncedLoading$ = this.notDebouncedLoading.pipe(
    auditTime(this.delay),
    distinctUntilChanged()
  );

  constructor(public loadingController: LoadingController) {
    this.debouncedLoading$
      .pipe(
        concatMap(async (shouldBeShowing) =>
          shouldBeShowing ? await this.showLoader() : await this.hideLoader()
        )
      )
      .subscribe();
  }

  private async hideLoader() {
    if (this.loader) {
      await this.loader.dismiss();
      this.loader = null;
    }
  }
  private async showLoader() {
    this.loader = await this.loadingController.create({
      duration: 10000,
    });
    await this.loader.present();
  }

  public show() {
    this.loadingRequestedSubject.next(true);
  }
  public hide() {
    this.loadingRequestedSubject.next(false);
  }
}
