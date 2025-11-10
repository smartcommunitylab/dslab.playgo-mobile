import { TrackByFunction } from '@angular/core';
import { Photo } from '@capacitor/camera';
import { flatMap, initial, last, tail, times, zip } from 'lodash-es';
import { Duration } from 'luxon';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

export const isNotConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is T =>
    arg !== constant;

export const isConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is C =>
    arg === constant;

export const isNotNil = <T>(arg: T | null | undefined): arg is T =>
  arg !== null && arg !== undefined;

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

export function isOffline(): boolean {
  return (
    navigator.onLine === false ||
    // debug offline from console
    (environment.production === false && (window as any).debugOffline === true)
  );
}

export function isOfflineError(error: any): boolean {
  return (
    (error?.status === 0 && isOffline()) ||
    // debug offline from network
    (environment.production === false &&
      error?.status === 418 &&
      error?.error === 'offline')
  );
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

(window as any).safeStringify = safeStringify;
// Prints json like structure, but with [cycle] instead of repeating the same object
export function safeStringify(obj: any): string {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[cycle]';
        }
        cache.add(value);
      }
      return value;
    },
    2
  );
}
