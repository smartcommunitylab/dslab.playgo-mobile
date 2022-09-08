import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-my-campaign-card',
  templateUrl: './my-campaign-card.component.html',
  styleUrls: ['./my-campaign-card.component.scss'],
})
export class MyCampaignCardComponent implements OnInit {
  @Input() containerCampaign: PlayerCampaign;
  imagePath: SafeResourceUrl;
  bannerPath: SafeResourceUrl;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.imagePath = this.containerCampaign.campaign.logo.url
      ? this.containerCampaign.campaign.logo.url
      : 'data:image/jpg;base64,' + this.containerCampaign.campaign.logo.image;
    this.bannerPath = this.containerCampaign?.campaign?.banner?.url
      ? this.containerCampaign?.campaign?.banner?.url
      : 'data:image/jpg;base64,' +
        this.containerCampaign?.campaign?.banner?.image;
  }

  detailCampaign() {
    this.router.navigateByUrl(
      '/pages/tabs/home/details/' + this.containerCampaign.campaign.campaignId
    );
  }

  joinCamp() {
    console.log('joinCampaign');
  }

  challenges() {
    console.log('challenges');
  }
}
