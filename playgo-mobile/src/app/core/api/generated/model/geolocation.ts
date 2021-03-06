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

export interface Geolocation {
  accuracy?: number;
  activityConfidence?: number;
  activityType?: string;
  altitude?: number;
  batteryIsCharging?: boolean;
  batteryLevel?: number;
  certificate?: string;
  createdAt?: number;
  deviceId?: string;
  deviceModel?: string;
  geocoding?: Array<number>;
  geofence?: any;
  heading?: number;
  isMoving?: boolean;
  latitude?: number;
  longitude?: number;
  multimodalId?: string;
  recordedAt?: number;
  sharedTravelId?: string;
  speed?: number;
  travelId?: string;
  userId?: string;
  uuid?: string;
}
