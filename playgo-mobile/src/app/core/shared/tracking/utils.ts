/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { NgZone } from '@angular/core';
import { last } from 'lodash-es';
import { Observable, OperatorFunction } from 'rxjs';
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

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
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
