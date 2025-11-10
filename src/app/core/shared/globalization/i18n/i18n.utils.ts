import * as itDictionary from '../../../../../assets/i18n/it.json';
import * as enDictionary from '../../../../../assets/i18n/en.json';
import { StringPath } from '../../type.utils';

export type ItKeys = StringPath<typeof itDictionary>;
export type EnKeys = StringPath<typeof enDictionary>;

export type TranslateKey = ItKeys | EnKeys;

export type TranslateKeyWithParams =
  | TranslateKey
  | {
      key: TranslateKey;
      interpolateParams: Record<string, string>;
    };
