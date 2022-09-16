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
  private loadingRequestedSubject = new Subject<{
    changeCounter: number;
    topic: string;
  }>();

  private notDebouncedLoading: Observable<boolean> =
    this.loadingRequestedSubject.pipe(
      scan((mapOfOngoingLoadings, newUpdate) => {
        mapOfOngoingLoadings.add(newUpdate.topic, newUpdate.changeCounter);
        return mapOfOngoingLoadings;
      }, new CounterMap()),
      map((mapOfOngoingLoadings) => mapOfOngoingLoadings.isEmpty() === false),
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
    this.loader = await this.loadingController.create({});
    await this.loader.present();
  }

  public show(topic: string, timeout?: number) {
    this.loadingRequestedSubject.next({ topic, changeCounter: +1 });

    // quick way how to ensure that no topic will be forgotten
    setTimeout(() => {
      this.loadingRequestedSubject.next({
        topic,
        changeCounter: Number.NEGATIVE_INFINITY,
      });
    }, timeout || 10_000);
  }
  public hide(topic: string) {
    this.loadingRequestedSubject.next({ topic, changeCounter: -1 });
  }
}

class CounterMap {
  private map: Record<string, number> = {};

  public add(key: string, value: number) {
    const previousValue = this.map[key] || 0;
    const newValue = previousValue + value;
    this.map[key] = newValue;
    if (newValue <= 0) {
      delete this.map[key];
    }
  }

  public isEmpty() {
    return Object.keys(this.map).length === 0;
  }
}
