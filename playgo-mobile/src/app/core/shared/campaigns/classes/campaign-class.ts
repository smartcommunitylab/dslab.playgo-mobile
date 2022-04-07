import { Challenge } from './challenge';

export class CampaignClass {
  active?: boolean;
  type?: string;
  campaignId?: string; //id
  communications?: boolean;
  dateFrom?: string; //from
  dateTo?: string; //to
  description?: string;
  gameId?: string;
  logoUrl?: string; //logo
  name?: string; //title
  organization?: string;
  registrationUrl?: string;
  privacyUrl?: string; // privacy
  rulesUrl?: string; //rules
  territoryId?: string;
  validationData?: any;
  webPageUrl?: string;

  // Not present in current API
  application?: string;
  limits?: [];
  means?: [];
  lastNotification?: string;

}
