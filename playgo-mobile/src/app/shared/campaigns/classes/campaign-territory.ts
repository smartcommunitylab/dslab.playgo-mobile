import { CampaignClass } from './campaign-class';
import { CompanyDetails } from './company-details';

export class CampaignTerritory extends CampaignClass {

  totalGreenLeves?: string;
  totalGreenLevesPerWeek?: string;
  greenLeaveLeftForNextLevel?: string;
  level?: string;
  percentage?: string;
  companyDetails?: CompanyDetails;
  tierList?: any;
}
