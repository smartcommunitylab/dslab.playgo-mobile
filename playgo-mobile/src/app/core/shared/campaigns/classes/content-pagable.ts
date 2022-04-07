/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/ban-types */

import { CampaignClass } from './campaign-class';
import { CampaignCompany } from './campaign-company';
import { CampaignPersonal } from './campaign-personal';
import { CampaignSchool } from './campaign-school';
import { CampaignTerritory } from './campaign-territory';

export class ContentPagable {
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
  empty?: boolean;
  content?: (
    | CampaignClass
    | CampaignCompany
    | CampaignSchool
    | CampaignPersonal
    | CampaignTerritory
  )[];
  pagable?: {};
  sort?: {};

  constructor(totalPages, number) {
    this.totalPages = totalPages;
    this.number = number;
  }
}
