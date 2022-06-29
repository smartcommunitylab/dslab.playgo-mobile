import { TranslateKey } from '../shared/type.utils';

export const ERRORS: KnownError[] = [
  {
    value: 401,
    msg: 'user not found',
    errorString: 'errors.userNotFound',
  },
  {
    value: 400,
    msg: 'nickname already exists',
    errorString: 'errors.nickNameExist',
  },
];
type KnownError = {
  value: number;
  msg: string;
  errorString: TranslateKey;
};
