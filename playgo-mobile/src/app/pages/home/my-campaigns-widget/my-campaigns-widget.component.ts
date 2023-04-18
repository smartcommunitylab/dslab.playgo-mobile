import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { map, Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-my-campaigns-widget',
  templateUrl: './my-campaigns-widget.component.html',
  styleUrls: ['./my-campaigns-widget.component.scss'],
})
export class MyCampaignsWidgetComponent implements OnInit, OnDestroy {
  myCampaigns: PlayerCampaign[];
  sub: Subscription;
  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.sub = this.campaignService.myCampaigns$.pipe(
      map((data: PlayerCampaign[]) =>
        data.sort((a, b) => b.subscription.registrationDate - a.subscription.registrationDate)))
      .subscribe((campaigns) => {
        this.myCampaigns = campaigns;
      });
  }
  discover() {
    this.navCtrl.navigateRoot('pages/tabs/campaigns');
  }
  ngOnDestroy() {
  }
  ionViewDidLeave() {
    this.sub.unsubscribe();

  }
}
