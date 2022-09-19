import { isEqual, isPlainObject } from 'lodash-es';
import * as itDictionary from '../../../../../assets/i18n/it.json';
import * as enDictionary from '../../../../../assets/i18n/en.json';

export function assertDictionariesAreEqualInRuntime() {
  const itKeys = allKeys({ ...itDictionary });
  const enKeys = allKeys({ ...enDictionary });

  const areDictionariesEqual = isEqual(itKeys, enKeys);

  if (!areDictionariesEqual) {
    const missingKeysInIt = enKeys.filter((key) => !itKeys.includes(key));
    const missingKeysInEn = itKeys.filter((key) => !enKeys.includes(key));
    console.error(
      'Dictionaries are not equal! Missing keys in italian dictionary',
      missingKeysInIt
    );
    console.error(
      'Dictionaries are not equal! Missing keys in english dictionary',
      missingKeysInEn
    );
  }
}

const allKeys = (o: any, prefix = '', out: string[] = []) => {
  if (isPlainObject(o)) {
    Object.entries(o).forEach(([k, v]) =>
      allKeys(v, prefix === '' ? k : `${prefix}.${k}`, out)
    );
  } else {
    out.push(prefix);
  }
  return out;
};
