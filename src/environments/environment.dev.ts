/* eslint-disable @typescript-eslint/naming-convention */

import { createEnvironment, Environment } from './create-environment';

export const environment: Environment = createEnvironment({
  name: 'development',
  aacConfig: 'default',
  apiServer: 'dev',
  releaseToStore: false,
});
