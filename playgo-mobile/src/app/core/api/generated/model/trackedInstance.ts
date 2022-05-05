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
import { Geolocation } from './geolocation';
import { ValidationResult } from './validationResult';

export interface TrackedInstance {
  approved?: boolean;
  changedValidity?: TrackedInstance.ChangedValidityEnum;
  clientId?: string;
  complete?: boolean;
  day?: string;
  deviceInfo?: string;
  freeTrackingTransport?: string;
  geolocationEvents?: Array<Geolocation>;
  id?: string;
  multimodalId?: string;
  overriddenDistances?: { [key: string]: number };
  routesPolylines?: any;
  sharedTravelId?: string;
  startTime?: Date;
  started?: boolean;
  suspect?: boolean;
  territoryId?: string;
  time?: string;
  toCheck?: boolean;
  userId?: string;
  validating?: boolean;
  validationResult?: ValidationResult;
}
export namespace TrackedInstance {
  export type ChangedValidityEnum = 'INVALID' | 'PENDING' | 'VALID';
  export const ChangedValidityEnum = {
    INVALID: 'INVALID' as ChangedValidityEnum,
    PENDING: 'PENDING' as ChangedValidityEnum,
    VALID: 'VALID' as ChangedValidityEnum,
  };
}
