import { NgZone, TrackByFunction } from '@angular/core';
import { Photo } from '@capacitor/camera';
import { flatMap, initial, isNil, last, tail, zip } from 'lodash-es';
import { DateTime, DateTimeUnit, Duration } from 'luxon';
import {
  concat,
  from,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  ObservableInput,
  ObservedValueOf,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  Challenge,
  ChallengeType,
} from 'src/app/pages/challenges/challenges.page';
import { environment } from 'src/environments/environment';
import { LocalStorageType } from './services/local-storage.service';

export const isNotConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is T =>
    arg !== constant;

export const isConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is C =>
    arg === constant;

export const isInstanceOf =
  <T>(type: new (...args: any[]) => T) =>
  <U>(arg: U | T): arg is T =>
    arg instanceof type;

export function groupByConsecutiveValues<T, K extends keyof T>(
  array: T[],
  needle: K
): { group: T[K]; values: T[] }[] {
  return array.reduce((accumulator, currentValue) => {
    const lastGroup = last(accumulator);
    const currentGroupValue = currentValue[needle];
    if (lastGroup && currentGroupValue === lastGroup.group) {
      lastGroup.values.push(currentValue);
    } else {
      accumulator.push({
        group: currentGroupValue,
        values: [currentValue],
      });
    }
    return accumulator;
  }, [] as { group: T[K]; values: T[] }[]);
}

export function tapLog<T>(...logMsgs: any[]) {
  return tap((data: T) => console.log(...logMsgs, data));
}

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
    new Observable((observer) => {
      const onNext = (value: T) => contextFunction(() => observer.next(value));
      const onError = (e: any) => contextFunction(() => observer.error(e));
      const onComplete = () => contextFunction(() => observer.complete());
      return source.subscribe(onNext, onError, onComplete);
    });
}

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

export function ifOfflineUseStored<T>(
  storage: LocalStorageType<T>,
  integrityCheck: (value: T) => boolean = () => true
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: any) => {
        if (isOfflineError(error)) {
          console.log('using offline mode!');
          const storedValue = storage.get();
          if (!isNil(storedValue) && integrityCheck(storedValue)) {
            return of(storedValue);
          }
        }
        return throwError(() => error) as Observable<T>;
      })
    );
}

export function isOffline(): boolean {
  return (
    navigator.onLine === false ||
    // debug offline from console
    (environment.production === false && (window as any).debugOffline === true)
  );
}

export function isOfflineError(error: any): boolean {
  return (
    (error.status === 0 && isOffline()) ||
    // debug offline from network
    (environment.production === false &&
      error.status === 418 &&
      error.error === 'offline')
  );
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

export function castTo<TO>() {
  return <FROM>(source: Observable<FROM>) =>
    source as unknown as Observable<TO>;
}

export function getDebugStack(): string {
  return new Error().stack || 'stack not available';
}

export async function readAsBase64(photo: Photo) {
  // Fetch the photo, read as a blob, then convert to base64 format
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const response = await fetch(photo.webPath!);
  const blob = await response.blob();
  return blob;
  //return await convertBlobToBase64(blob) as string;
}
export function convertBlobToBase64(blob: Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
/**
 * [1,2,3,4] -> [[1,2], [2,3], [3,4]]
 */
export const getAdjacentPairs = <T>(a: T[]) => zip(initial(a), tail(a));

type MapCartesian<T extends any[][]> = {
  [P in keyof T]: T[P] extends Array<infer U> ? U : never;
};
/** Create all combinations of input arrays
 * cartesian(['a', 'b'], [1, 2]) => [['a', 1], ['a', 2], ['b', 1], ['b', 2]]
 */
export const cartesian = <T extends any[][]>(...arr: T): MapCartesian<T>[] =>
  arr.reduce(
    (a, b) => flatMap(a, (c) => b.map((d) => [...c, d])),
    [[]]
  ) as MapCartesian<T>[];

export async function time(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function formatDurationToHoursAndMinutes(millis: number): string {
  const duration = Duration.fromMillis(Math.abs(millis)).shiftTo(
    'hours',
    'minutes'
  );
  const hours = duration.hours;
  const minutes = Math.round(duration.minutes);
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  } else {
    return `${minutes} min`;
  }
}

export function trackByProperty<T>(property: keyof T): TrackByFunction<T> {
  return (index: number, item: T) => item[property];
}

export const waitMs = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function getImgChallenge(challengeType: string) {
  if (
    [
      'groupCooperative',
      'groupCompetitiveTime',
      'groupCompetitivePerformance',
    ].indexOf(challengeType) > -1
  ) {
    return challengeType;
  }
  return 'default';
}
export function getTypeStringChallenge(challengeType: string) {
  if (
    [
      'groupCooperative',
      'groupCompetitiveTime',
      'groupCompetitivePerformance',
      'survey',
    ].indexOf(challengeType) > -1
  ) {
    return 'challenges.challenge_model.name.' + challengeType;
  }
  return 'challenges.challenge_model.name.default';
}

export type Period = {
  labelKey: string;
  label: string;
  add: string;
  format: string;
  switchTo: string;
  group: DateTimeUnit;
  from: DateTime;
  to: DateTime;
};

export function getPeriods(referenceDate: DateTime): Period[] {
  return [
    {
      labelKey: 'campaigns.stats.filter.period.week',
      label: 'dd-MMMM',
      group: 'day',
      format: 'dd-MM',
      add: 'week',
      switchTo: null,
      from: referenceDate.startOf('week'),
      to: referenceDate.endOf('week'),
    },
    {
      labelKey: 'campaigns.stats.filter.period.month',
      label: 'MMMM',
      group: 'week',
      format: 'dd-MM-yyyy',
      add: 'month',
      switchTo: 'day',
      from: referenceDate.startOf('month'),
      to: referenceDate.endOf('month'),
    },
    {
      labelKey: 'campaigns.stats.filter.period.year',
      label: 'yyyy',
      group: 'month',
      format: 'MM-yyyy',
      add: 'year',
      switchTo: 'week',
      from: referenceDate.startOf('year'),
      to: referenceDate.endOf('year'),
    },
  ];
}
