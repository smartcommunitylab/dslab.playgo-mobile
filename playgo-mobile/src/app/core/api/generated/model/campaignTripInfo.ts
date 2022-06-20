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

export interface CampaignTripInfo {
  campaignId?: string;
  campaignName?: { [key: string]: string };
  distance?: number;
  errorCode?: string;
  score?: number;
  scoreStatus?: CampaignTripInfo.ScoreStatusEnum;
  type?: CampaignTripInfo.TypeEnum;
  valid?: boolean;
}
export namespace CampaignTripInfo {
  export type ScoreStatusEnum = 'ASSIGNED' | 'COMPUTED' | 'SENT' | 'UNASSIGNED';
  export const ScoreStatusEnum = {
    ASSIGNED: 'ASSIGNED' as ScoreStatusEnum,
    COMPUTED: 'COMPUTED' as ScoreStatusEnum,
    SENT: 'SENT' as ScoreStatusEnum,
    UNASSIGNED: 'UNASSIGNED' as ScoreStatusEnum,
  };
  export type TypeEnum = 'city' | 'company' | 'personal' | 'school';
  export const TypeEnum = {
    City: 'city' as TypeEnum,
    Company: 'company' as TypeEnum,
    Personal: 'personal' as TypeEnum,
    School: 'school' as TypeEnum,
  };
}
