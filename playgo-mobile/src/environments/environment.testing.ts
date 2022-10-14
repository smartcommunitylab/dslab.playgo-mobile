/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Dev like environment, but with production servers
 */

import { createEnvironment, Environment } from './create-environment';

export const environment: Environment = createEnvironment({
  name: 'testing',
  aacConfig: 'default',
  apiServer: 'dev',
  releaseToStore: false,
});
