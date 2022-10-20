import { Injectable } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  scan,
  Subject,
  switchMap,
  timeout,
} from 'rxjs';

/**
 * This service is used to refresh the content of any page.
 *
 * In fact we have one global refresher. If some page will trigger refresher
 * all other pages / services which subscribe to `refreshed$` will be notified.
 *
 * This is usually little more data being refreshed that user wants, but not too much
 * During life of app usually only one page is "alive", rest of pages will have their
 * onDestroy called, which will unsubscribe observables and so also `refreshed$`.
 * So this is not a problem.
 *
 * (Ok there could be more then one page alive, due to ionic magic,
 * which could keep one page per tab to be alive, and only hide/show them
 * using css. But still no problem - at least these pages will have up to date
 * date when they will be shown again.)
 *
 * One challenging thing was how to hide refresher animation. As we have only one
 * global refreshing, page that initiated it, does not know when it is finished.
 * (it could be deep in some service)
 *
 * So we are doing similar thing as in spinnerService, and counting how many api calls
 * are ongoing. When there is no more api calls, we hide refresher.
 */
@Injectable({
  providedIn: 'root',
})
export class RefresherService {
  private refreshSubject = new Subject<void>();

  public refreshed$: Observable<void> = this.refreshSubject.asObservable();

  private httpCallSubject = new Subject<1 | -1>();

  private isHttpCallInProgress$: Observable<boolean> =
    this.httpCallSubject.pipe(
      scan((acc, curr) => acc + curr, 0),
      map((count) => count > 0),
      distinctUntilChanged(),
      // if call is ended and another one is opened in the same time, we don't want to emit
      // we assume that is also second call is caused by same refresher...
      debounceTime(100)
    );

  // hide refresher when there is no more http calls, but max 3 seconds.
  private shouldCompleteRefresh$: Observable<void> = this.refreshed$.pipe(
    switchMap(() =>
      this.isHttpCallInProgress$.pipe(
        filter((isInProgress) => !isInProgress),
        map(() => null),
        timeout({ first: 3000, with: () => of(null) })
      )
    )
  );

  constructor() {
    this.shouldCompleteRefresh$.subscribe(() => {
      this.completeFunction();
    });
  }

  private completeFunction: () => void = () => {};

  public onRefresh(event: RefresherCustomEvent): void {
    this.refreshSubject.next();
    if (event && event.detail) {
      this.completeFunction = event.detail.complete;
    }
  }

  public httpCallStarted(): void {
    this.httpCallSubject.next(1);
  }
  public httpCallEnded(): void {
    this.httpCallSubject.next(-1);
  }
}
