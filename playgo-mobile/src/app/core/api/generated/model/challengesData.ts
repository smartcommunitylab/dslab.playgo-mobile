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
import { OtherAttendeeData } from './otherAttendeeData';

export interface ChallengesData {
  active?: boolean;
  bonus?: number;
  challCompleteDesc?: string;
  challCompletedDate?: number;
  challDesc?: string;
  challId?: string;
  challTarget?: number;
  daysToEnd?: number;
  endDate?: number;
  otherAttendeeData?: OtherAttendeeData;
  proposerId?: string;
  rowStatus?: number;
  startDate?: number;
  status?: number;
  success?: boolean;
  type?: string;
  unit?: string;
}
