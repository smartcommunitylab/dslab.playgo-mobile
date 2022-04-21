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
import { CampaignPlacing } from './campaignPlacing';
import { Sort } from './sort';
import { SwaggerPageable } from './swaggerPageable';

export interface PageCampaignPlacing {
  content?: Array<CampaignPlacing>;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  pageable?: SwaggerPageable;
  size?: number;
  sort?: Sort;
  totalElements?: number;
  totalPages?: number;
}
