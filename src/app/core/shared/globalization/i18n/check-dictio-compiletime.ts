import { EnKeys, ItKeys } from './i18n.utils';

// ---------- Check if translation are same for it, en ----------------- //

// This is should generate an compile time error if it.json and en.json does not contain same keys.
// To get list of missing translations just hover above types.
// If there is no missing translation, correct type will be "never".

type KeysMissingInItalianDictionary = Exclude<EnKeys, ItKeys>;
type KeysMissingInEnglishDictionary = Exclude<ItKeys, EnKeys>;

const errorHereMeansThatKeyIsMissingInItalianDictionary: '' =
  null as KeysMissingInItalianDictionary;
const errorHereMeansThatKeyIsMissingInEnglishDictionary: '' =
  null as KeysMissingInEnglishDictionary;

// to suppress "unused variable" error
((...a) => {})(
  errorHereMeansThatKeyIsMissingInItalianDictionary,
  errorHereMeansThatKeyIsMissingInEnglishDictionary
);
