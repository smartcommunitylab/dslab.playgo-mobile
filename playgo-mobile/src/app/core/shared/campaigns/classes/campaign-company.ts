import { CampaignClass } from './campaign-class';
import { CompanyDetails } from './company-details';

export class CampaignCompany extends CampaignClass {
  percentage?: string;
  totalKm?: string;
  totalKmPerWeek?: string;
  kmPerDay?: string;
  maxKmPerDay?: string;
  companyDetails?: CompanyDetails;
}
