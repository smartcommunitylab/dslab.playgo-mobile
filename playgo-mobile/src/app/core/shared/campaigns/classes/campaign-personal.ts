import { CampaignClass } from './campaign-class';
import { Challenge } from './challenge';

export class CampaignPersonal extends CampaignClass {

  totalGreenLeves?: string;
  level?: string;
  greenLeaveLeftForNextLevel?: string;
  percentage?: string;
  challenges?: Challenge[];

}
