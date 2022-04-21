/**
 * Play&Go Project
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 2.0
 * Contact: info@smartcommunitylab.it
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { CampaignTripInfo } from './campaignTripInfo';

export interface TrackedInstanceInfo {
  campaigns?: Array<CampaignTripInfo>;
  distance?: number;
  endTime?: Date;
  modeType?: string;
  multimodalId?: string;
  polyline?: string;
  startTime?: Date;
  trackedInstanceId?: string;
  validity?: TrackedInstanceInfo.ValidityEnum;
}
export namespace TrackedInstanceInfo {
  export type ValidityEnum = 'INVALID' | 'PENDING' | 'VALID';
  export const ValidityEnum = {
    INVALID: 'INVALID' as ValidityEnum,
    PENDING: 'PENDING' as ValidityEnum,
    VALID: 'VALID' as ValidityEnum,
  };
}
