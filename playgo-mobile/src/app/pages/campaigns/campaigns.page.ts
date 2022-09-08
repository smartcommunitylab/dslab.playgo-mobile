import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-campaigns',
  templateUrl: 'campaigns.page.html',
  styleUrls: ['campaigns.page.scss'],
})
export class CampaignsPage implements OnInit {
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  selectedSegment?: string;

  constructor(private campaignService: CampaignService) {}

  ngOnInit(): void {
    this.selectedSegment = 'publicCampaigns';
  }
  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }
}
