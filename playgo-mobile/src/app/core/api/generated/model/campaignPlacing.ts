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
import { Image } from './image';

export interface CampaignPlacing {
  avatar?: Image;
  groupId?: string;
  nickname?: string;
  playerId?: string;
  position?: number;
  value?: number;
}
