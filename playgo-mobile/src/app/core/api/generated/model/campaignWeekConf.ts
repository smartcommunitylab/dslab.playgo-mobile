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
import { CampaignReward } from './campaignReward';

export interface CampaignWeekConf {
  campaignId?: string;
  dateFrom?: number;
  dateTo?: number;
  rewards?: Array<CampaignReward>;
  weekNumber?: number;
}
