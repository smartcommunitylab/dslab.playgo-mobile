import { tap } from 'rxjs/operators';

export const isNotConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is T =>
    arg !== constant;

export const isConstant =
  <C>(constant: C) =>
  <T>(arg: T | C): arg is C =>
    arg === constant;

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function tapLog<T>(...logMsgs: any[]) {
  return tap((data: T) => console.log(...logMsgs, data));
}
