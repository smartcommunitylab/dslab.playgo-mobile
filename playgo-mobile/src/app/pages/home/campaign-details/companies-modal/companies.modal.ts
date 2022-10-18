import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './companies.modal.html',
  styleUrls: ['./companies.modal.scss'],
})
export class CompaniesCampaignModalPage implements OnInit {
  campaign?: Campaign;
  companies: any;
  sub: Subscription;
  constructor(
    private modalController: ModalController,
    private campaignService: CampaignService
  ) {}
  ngOnInit() {
    this.sub = this.campaignService
      .getCompaniesForSubscription(this?.campaign?.campaignId)
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
