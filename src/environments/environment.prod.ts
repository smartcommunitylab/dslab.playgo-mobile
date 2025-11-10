/* eslint-disable @typescript-eslint/naming-convention */
// ---------- Check if translation are same for it, en ----------------- //
import 'src/app/core/shared/globalization/i18n/check-dictio-compiletime';
import { createEnvironment, Environment } from './create-environment';

export const environment: Environment = createEnvironment({
  name: 'production',
  aacConfig: 'default',
  apiServer: 'prod',
  releaseToStore: true,
});
