// This file WILL be replaced during build by using the `fileReplacements` array.
// The list of file replacements can be found in `angular.json`.


import { createEnvironment, Environment } from './create-environment';

export const environment: Environment = createEnvironment({
  name: 'stage',
  aacConfig: 'stage',
  apiServer: 'dev',
  releaseToStore: true,
});
