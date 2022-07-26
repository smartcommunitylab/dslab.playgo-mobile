import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-public-campaign-card',
  templateUrl: './public-campaign-card.component.html',
  styleUrls: ['./public-campaign-card.component.scss'],
})
export class PublicCampaignCardComponent implements OnInit {
  @Input() campaign: Campaign;
  imagePath: string;
  bannerPath: string;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.imagePath = this.campaign.logo.url
      ? this.campaign.logo.url
      : 'data:image/jpg;base64,' + this.campaign.logo.image;
    this.bannerPath = this.campaign.banner.url
      ? this.campaign.banner.url
      : 'data:image/jpg;base64,' + this.campaign.banner.image;
  }

  joinCamp() {
    this.router.navigateByUrl(
      '/pages/tabs/campaigns/join/' + this.campaign.campaignId
    );
  }
}
