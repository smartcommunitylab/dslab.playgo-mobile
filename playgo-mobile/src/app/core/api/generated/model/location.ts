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
import { Activity } from './activity';
import { Battery } from './battery';
import { Coords } from './coords';

export interface Location {
  activity?: Activity;
  battery?: Battery;
  coords?: Coords;
  extras?: any;
  geofence?: any;
  isMoving?: boolean;
  timestamp?: Date;
  uuid?: string;
}
