import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-company-label',
  templateUrl: './app-company-label.component.html',
  styleUrls: ['./app-company-label.component.scss'],
})
export class CompanyLabelComponent implements OnInit {
  @Input() campaignContainer: PlayerCampaign;
  sub: Subscription;
  companyLabel: string;
  constructor(private campaignService: CampaignService) { }

  ngOnInit() {
    this.initCompanies();
  }
  async initCompanies() {
    this.companyLabel = await this.campaignService
      .getCompanyOfTheUser(this.campaignContainer);
  }

}
