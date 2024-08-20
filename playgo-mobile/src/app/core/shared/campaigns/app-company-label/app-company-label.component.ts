import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from '../../services/campaign.service';
import { CompanyModalPage } from './company-modal/company.modal';

@Component({
  selector: 'app-company-label',
  templateUrl: './app-company-label.component.html',
  styleUrls: ['./app-company-label.component.scss'],
})
export class CompanyLabelComponent implements OnInit {
  @Input() campaignContainer: PlayerCampaign;
  sub: Subscription;
  userCompany: any;
  constructor(private campaignService: CampaignService, private modalController: ModalController) { }

  ngOnInit() {
    this.initCompanies();
  }
  async initCompanies() {
    try {
      this.userCompany = await this.campaignService
        .getCompanyOfTheUser(this.campaignContainer);
    } catch (error) {
      console.error(error);
    }
  }
  async openCompanyDetail(event: any) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: CompanyModalPage,
      componentProps: {
        userCompany: this.userCompany,
      },
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }

}
