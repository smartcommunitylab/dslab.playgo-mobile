import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-campaigns',
  templateUrl: 'campaigns.page.html',
  styleUrls: ['campaigns.page.scss'],
})
export class CampaignsPage implements OnInit, OnDestroy {
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  selectedSegment?: string;
  sub: Subscription;

  constructor(private campaignService: CampaignService) { }

  ngOnInit(): void {
    this.selectedSegment = 'myCampaigns';
    this.sub = this.campaignService.playerCampaignsRefresher$.subscribe((campaigns) => {
      this.refresher.complete();
    });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  refreshList(event) {
    //updatelist maybechanged?
    this.campaignService.playerCampaignsRefresher$.next();
  }
}
