/* eslint-disable @typescript-eslint/naming-convention */
import 'zone.js/dist/zone-error'; // Included with Angular CLI.

import { createEnvironment, Environment } from './create-environment';

export const environment: Environment = createEnvironment({
  name: 'development',
  aac: 'default',
  apiServer: 'dev',
  releaseToStore: false,
});
