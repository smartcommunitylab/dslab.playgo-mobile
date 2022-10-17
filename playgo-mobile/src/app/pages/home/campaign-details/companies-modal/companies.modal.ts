import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CampaignDetail } from 'src/app/core/api/generated/model/campaignDetail';
import { CampaignSubscription } from 'src/app/core/api/generated/model/campaignSubscription';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './companies.modal.html',
  styleUrls: ['./companies.modal.scss'],
})
export class CompaniesCampaignModalPage implements OnInit {
  campaignContainer?: PlayerCampaign;
  companies: any;
  sub: Subscription;
  constructor(
    private modalController: ModalController,
    private campaignService: CampaignService
  ) {}
  ngOnInit() {
    this.sub = this.campaignService
      .getCompaniesForSubscription(this.campaignContainer?.campaign?.campaignId)
      .subscribe((result) => {
        if (result) {
          this.companies = result;
        }
      });
  }
  close() {
    this.modalController.dismiss(false);
  }
}
