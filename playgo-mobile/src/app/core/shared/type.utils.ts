import * as itDictionary from '../../../assets/i18n/it.json';

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

type Dictionary = typeof itDictionary;

export type TranslateKey = StringPath<Dictionary>;

export type TranslateKeyWithParams =
  | TranslateKey
  | {
      key: TranslateKey;
      interpolateParams: Record<string, string>;
    };
