import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CompanyMapModalPage } from './company-map/company-map.modal';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.page.html',
  styleUrls: ['./company-detail.page.scss'],
})
export class CompanyDetailPage implements OnInit {
  campaignContainer: PlayerCampaign;
  company: any;
  imagePath: string;

  constructor
    (
      public router: Router,
      private modalController: ModalController

    ) {
    if (router.getCurrentNavigation().extras.state) {
      this.company = this.router.getCurrentNavigation().extras.state;
    }
  }

  ngOnInit() {
    this.imagePath = this.company.logo;

  }

  async openMap(center: any, allLocations: any, selectedLocation: any) {
    const modal = await this.modalController.create({
      component: CompanyMapModalPage,
      cssClass: 'challenge-info',
      swipeToClose: true,
      componentProps: {
        center,
        allLocations,
        selectedLocation
      },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
  openWebsite(website: string) {
    Browser.open({
      url: website,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openMail(mail: string) {
    window.open('mailto:' + mail);
  }
  openPhone(phone: string) {
    window.open('tel:' + phone);
  }
}
