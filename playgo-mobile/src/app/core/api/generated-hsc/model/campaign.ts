/**
 * Play&Go HSC Project
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 2.0
 * Contact: info@smartcommunitylab.it
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { CampaignDetail } from './campaignDetail';
import { Image } from './image';

export interface Campaign {
  active?: boolean;
  banner?: Image;
  campaignId?: string;
  communications?: boolean;
  dateFrom?: number;
  dateTo?: number;
  description?: { [key: string]: string };
  details?: { [key: string]: Array<CampaignDetail> };
  gameId?: string;
  logo?: Image;
  name?: { [key: string]: string };
  specificData?: any;
  startDayOfWeek?: number;
  territoryId?: string;
  validationData?: any;
  visible?: boolean;
}
