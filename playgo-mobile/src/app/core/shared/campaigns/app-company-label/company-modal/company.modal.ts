import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { CompanyMapModalPage } from 'src/app/pages/home/campaign-details/companies/company-detail-page/company-map/company-map.modal';
@Component({
  selector: 'app-company-modal',
  templateUrl: './company.modal.html',
  styleUrls: ['./company.modal.scss'],
})
export class CompanyModalPage implements OnInit {
  userCompany: any;
  imagePath: string;

  constructor(private modalController: ModalController) { }
  ngOnInit() {
    this.imagePath = this.userCompany?.company?.logo;

  }
  close() {
    this.modalController.dismiss(false);
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
}
