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
import { Binary } from './binary';

export interface Avatar {
  avatarData?: Binary;
  avatarDataSmall?: Binary;
  contentType?: string;
  fileName?: string;
  id?: string;
  playerId?: string;
}