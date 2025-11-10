import { NgZone } from '@angular/core';
import { negate, isNil, times, last } from 'lodash-es';
import {
  catchError,
  concat,
  concatMap,
  filter,
  first,
  from,
  map,
  merge,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  ObservableInput,
  ObservedValueOf,
  OperatorFunction,
  shareReplay,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { LocalStorageType } from './services/local-storage.service';
import { isOfflineError } from './utils';

export function tapLog<T>(...logMsgs: any[]) {
  return tap((data: T) => console.log(...logMsgs, data));
}

export function mapTo<R>(value: R): OperatorFunction<unknown, R> {
  return map(() => value);
}

export function castTo<TO>() {
  return <FROM>(source: Observable<FROM>) =>
    source as unknown as Observable<TO>;
}

export function asyncFilter<T>(
  predicate: (value: T, index: number) => Promise<boolean>
): MonoTypeOperatorFunction<T> {
  return concatMap((value: T, index: number) =>
    from(predicate(value, index)).pipe(
      filter(Boolean),
      map(() => value)
    )
  );
}

/// MERGING OF OBSERVABLES ///

export function startFrom<T, O extends ObservableInput<any>>(
  start: O
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return (source: Observable<T>) => concat(start, source);
}

/** like concat, but don't wait to complete */
export function beforeStartUse<T, O extends ObservableInput<any>>(
  start: O
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return (source: Observable<T>) =>
    merge(from(start).pipe(takeUntil(source)), source);
}

/** `s.withLatestFrom(t)` will skip all `a` values until first `b` is emitted
 * this operator will emit all skipped `a` values at the same time when first `b` is emitted
 * than it behaves like `withLatestFrom`.
 */
export function withReplayedLatestFrom<T, O>(
  target: Observable<O>
): OperatorFunction<T, [T, O]> {
  return (source: Observable<T>) => {
    const sharedTarget = target.pipe(shareReplay(1));
    sharedTarget.pipe(takeUntil(source)).subscribe();
    return source.pipe(
      mergeMap((sourceVal) =>
        sharedTarget.pipe(
          first(),
          map((targetVal) => [sourceVal, targetVal] as [T, O])
        )
      )
    );
  };
}

/// RUNNING IN ANGULAR ///

export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return runInContext(zone.run.bind(zone));
}
export function runOutsideAngular<T>(zone: NgZone): OperatorFunction<T, T> {
  return runInContext(zone.runOutsideAngular.bind(zone));
}

export function runInContext<T>(
  contextFunction: NgZone['run']
): OperatorFunction<T, T> {
  return (source) =>
    new Observable((observer) =>
      source.subscribe({
        next: (value: T) => contextFunction(() => observer.next(value)),
        error: (e: any) => contextFunction(() => observer.error(e)),
        complete: () => contextFunction(() => observer.complete()),
      })
    );
}

/// ERROR HANDLING ///

export function ifOfflineUseStored<T>(
  storage: LocalStorageType<T>,
  integrityCheck: (value: T) => boolean = () => true
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: any) => {
        if (isOfflineError(error)) {
          return from(storage.get()).pipe(
            filter(negate(isNil)),
            filter(integrityCheck)
          );
        }
        return throwError(() => error) as Observable<T>;
      })
    );
}

export function throwIfNil<T>(
  errorFn: (value: T, index: number) => any
): OperatorFunction<T, Exclude<T, null | undefined>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((value, index) => {
        if (value === null || value === undefined) {
          throw errorFn(value, index);
        }
        return value as Exclude<T, null | undefined>;
      })
    );
}

/// TESTING ///

/**
 * Useful function do display marble like strings
 *
 * returns string like: --x---x----|
 *
 * useful in matcher:
```
    testScheduler = new TestScheduler((actual, expected) => {
      expect(framesToString(actual)).toBe(framesToString(expected));
      expect(actual).toEqual(expected);
    });
```
 */
export function framesToString(
  frames: {
    frame: number;
    notification: {
      kind: 'N' | 'E' | 'C';
      value: any;
      error: any;
    };
  }[]
) {
  const notificationMap = {
    ['N']: 'x',
    ['E']: '#',
    ['C']: '|',
  };
  return times(last(frames).frame + 1)
    .map((idx) => {
      const framesAtIndex = frames.filter((frame) => frame.frame === idx);
      if (framesAtIndex.length === 1) {
        return notificationMap[framesAtIndex[0].notification.kind];
      }
      if (framesAtIndex.length > 1) {
        return framesAtIndex.length;
      }
      return '-';
    })
    .join('');
}
