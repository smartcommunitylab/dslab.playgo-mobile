import { Observable } from 'rxjs';
import * as itDictionary from '../../../assets/i18n/it.json';
import * as enDictionary from '../../../assets/i18n/en.json';

type StringableKey<T> = T extends readonly unknown[]
  ? number extends T['length']
    ? number
    : `${number}`
  : string | number;

export type StringPath<T> = T extends object
  ? {
      [P in keyof T & StringableKey<T>]: `${P}` | `${P}.${StringPath<T[P]>}`;
    }[keyof T & StringableKey<T>]
  : never;

export type ItKeys = StringPath<typeof itDictionary>;
export type EnKeys = StringPath<typeof enDictionary>;

export type TranslateKey = ItKeys | EnKeys;

export type TranslateKeyWithParams =
  | TranslateKey
  | {
      key: TranslateKey;
      interpolateParams: Record<string, string>;
    };

export type UnwrapObservable<T> = T extends Observable<infer U> ? U : never;
export type UnwrapArray<T> = T extends Array<infer U> ? U : never;

/**
 * `assertType<A>(a)` is equal to: `const checkA:A = a;`
 *
 * But there are lot of cases where it is not practical to create variable to check type.
 *
 * Note that it is not the same as using `as A`. `as` will convince TS to treat any object as A.
 *
 * see https://github.com/microsoft/TypeScript/issues/47920
 */
export function assertType<
  T = { pleaseProvideGenericArgumentForTheFunction: unknown },
  InferT extends T = T
>(obj: InferT): T {
  return obj;
}

/**
 * Get the keys of T without any keys of U.
 */
export type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};

/**
 * Restrict using either exclusively the keys of T or exclusively the keys of U.
 *
 * No unique keys of T can be used simultaneously with any unique keys of U.
 *
 * Example:
 * `const myVar: XOR<T, U>`
 *
 * More: https://github.com/maninak/ts-xor/tree/master#description
 */
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
