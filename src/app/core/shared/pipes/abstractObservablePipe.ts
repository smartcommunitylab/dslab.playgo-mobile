import { ChangeDetectorRef } from '@angular/core';
import {
  Subject,
  takeUntil,
  switchMap,
  distinctUntilChanged,
  Observable,
  EMPTY,
  catchError,
} from 'rxjs';
import { isEqual } from 'lodash-es';

/**
 * Abstract class used to help creating efficient "push" pipes.
 *
 * Basically we would like to have a pipe that behaves like onPush component.
 * Being evaluated every time the input changes, but with ability to explicitly trigger a new value based
 * on observable.
 *
 * Sadly this is no possible right now, so this is a workaround. When using this class, you need to:
 * - implement `transformToObservable` method.
 * - use `super.doTransform` in `transform` method.
 * - use `super.destroy` in `ngOnDestroy` method.
 * - annotate your pipe with `@Pipe({ pure: false })`
 *
 */
export abstract class AbstractObservablePipe<I, O> {
  private pipeIsDestroyed$ = new Subject<void>();

  private requestsToTransformSubject = new Subject<I>();

  private formattedValue$: Observable<O> = this.requestsToTransformSubject.pipe(
    distinctUntilChanged(isEqual),
    switchMap((request) =>
      this.transformToObservable(request).pipe(
        catchError((e) => {
          console.error(e);
          return EMPTY;
        })
      )
    ),
    takeUntil(this.pipeIsDestroyed$)
  );

  private formattedValue: O = null;

  constructor(ref: ChangeDetectorRef) {
    this.formattedValue$.subscribe((formattedValue) => {
      this.formattedValue = formattedValue;
      // We actually do not have any means to output asynchronously value from the pipe,
      // so we force the change detection, and pipe will be re-evaluated. At this point we have
      // this.formattedValue set, and we will output it in the pipe. To avoid infinite loop, we use
      // distinctUntilChanged operator.
      ref.markForCheck();
    });
  }

  public doTransform(input: I) {
    this.requestsToTransformSubject.next(input);
    return this.formattedValue;
  }
  protected abstract transformToObservable(input: I): Observable<O>;

  destroy() {
    this.pipeIsDestroyed$.next();
    this.pipeIsDestroyed$.complete();
  }
}
