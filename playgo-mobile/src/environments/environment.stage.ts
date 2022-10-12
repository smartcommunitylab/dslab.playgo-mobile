/* eslint-disable @typescript-eslint/naming-convention */
/**
 * stage environment. To be used with stage productFlavors on Android and iOS
 * see android\app\build.gradle
 * Main differences is separate url schema and acc
 */

// ---------- Check if translation are same for it, en ----------------- //
import 'src/app/core/shared/globalization/i18n/check-dictio-compiletime';

import { createEnvironment, Environment } from './create-environment';

export const environment: Environment = createEnvironment({
  name: 'stage',
  aac: 'stage',
  apiServer: 'dev',
  releaseToStore: true,
});
