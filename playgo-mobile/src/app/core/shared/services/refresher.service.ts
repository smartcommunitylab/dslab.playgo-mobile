import { Injectable } from '@angular/core';
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
import { tapLog } from '../utils';

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
      tapLog('number of calls'),
      map((count) => count > 0),
      distinctUntilChanged(),
      // if call is ended and another one is opened in the same time, we don't want to emit
      // we assume that is also second call is caused by same refresher...
      debounceTime(100)
    );

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

  public onRefresh(): void {
    this.refreshSubject.next();
    console.log('REFRESH DETECTED');
  }

  public setCompleteFunction(complete: () => void): void {
    this.completeFunction = complete;
  }

  public httpCallStarted(): void {
    this.httpCallSubject.next(1);
  }
  public httpCallEnded(): void {
    this.httpCallSubject.next(-1);
  }
}
