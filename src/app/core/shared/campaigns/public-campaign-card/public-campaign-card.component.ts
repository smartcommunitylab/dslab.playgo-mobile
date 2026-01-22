import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-public-campaign-card',
  templateUrl: './public-campaign-card.component.html',
  styleUrls: ['./public-campaign-card.component.scss'],
  standalone: false,
})
export class PublicCampaignCardComponent implements OnInit {
  @Input() campaign: Campaign;
  imagePath: string;
  bannerPath: string;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    try {
      //  logo
      if (this.campaign?.logo) {
        this.imagePath = this.campaign.logo.url
          ? this.campaign.logo.url
          : this.campaign.logo.image
          ? 'data:image/jpg;base64,' + this.campaign.logo.image
          : '';  
      } else {
        this.imagePath = '';  
        console.warn('PublicCampaignCard: logo mancante per campagna', this.campaign?.campaignId);
      }
      //banner
      if (this.campaign?.banner) {
        this.bannerPath = this.campaign.banner.url
          ? this.campaign.banner.url
          : this.campaign.banner.image
          ? 'data:image/jpg;base64,' + this.campaign.banner.image
          : '';  
      } else {
        this.bannerPath = '';  
        console.warn('PublicCampaignCard: banner mancante per campagna', this.campaign?.campaignId);
      }
    } catch (error) {
      console.error('PublicCampaignCard: errore in ngOnInit', error);
      this.imagePath = '';
      this.bannerPath = '';
    }
  }

  joinCamp() {
    this.router.navigateByUrl(
      '/pages/tabs/campaigns/join/' + this.campaign.campaignId
    );
  }
}
