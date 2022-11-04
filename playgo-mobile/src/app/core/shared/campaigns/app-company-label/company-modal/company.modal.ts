import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-company-modal',
  templateUrl: './company.modal.html',
  styleUrls: ['./company.modal.scss'],
})
export class CompanyModalPage implements OnInit {
  userCompany: any;

  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
