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
import { PlayerInfo } from './playerInfo';
import { TrackedInstance } from './trackedInstance';

export interface TrackedInstancePoly {
  campaigns?: Array<CampaignTripInfo>;
  playerInfo?: PlayerInfo;
  routesPolylines?: any;
  trackPolyline?: string;
  trackedInstance?: TrackedInstance;
}
