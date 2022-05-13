import { NgZone } from '@angular/core';
import { Photo } from '@capacitor/camera';
import { initial, isNil, last, tail, zip } from 'lodash-es';
import { DateTime } from 'luxon';
import {
  concat,
  Observable,
  ObservableInput,
  ObservedValueOf,
  OperatorFunction,
} from 'rxjs';
import { tap } from 'rxjs/operators';

export const isNotConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is T =>
    arg !== constant;

export const isConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is C =>
    arg === constant;

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
  return (source) =>
    new Observable((observer) => {
      const onNext = (value: T) => zone.run(() => observer.next(value));
      const onError = (e: any) => zone.run(() => observer.error(e));
      const onComplete = () => zone.run(() => observer.complete());
      return source.subscribe(onNext, onError, onComplete);
    });
}
export function startFrom<T, O extends ObservableInput<any>>(
  start: O
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return (source: Observable<T>) => concat(start, source);
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

export async function time(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function toServerDateTime(dateTime: DateTime): string {
  if (isNil(dateTime)) {
    return '';
  }
  if (!dateTime.isValid) {
    console.error(
      'Invalid dateTime',
      dateTime,
      dateTime.invalidReason,
      dateTime.invalidExplanation
    );
    throw new Error('Invalid dateTime');
  }
  return dateTime.toUTC().toFormat('yyyy-MM-dd HH:mm:SSS');
}

export function toServerDateOnly(dateTime: DateTime): string {
  if (isNil(dateTime)) {
    return '';
  }
  if (!dateTime.isValid) {
    console.error(
      'Invalid dateTime',
      dateTime,
      dateTime.invalidReason,
      dateTime.invalidExplanation
    );
    throw new Error('Invalid dateTime');
  }
  return dateTime.toUTC().toFormat('yyyy-MM-dd');
}
