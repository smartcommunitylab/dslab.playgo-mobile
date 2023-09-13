import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LimitModalPage } from './limit-modal/limit.modal';

@Component({
  selector: 'app-limit-status',
  templateUrl: './limit-status.component.html',
  styleUrls: ['./limit-status.component.scss'],
})
export class LimitStatusComponent implements OnInit {
  @Input() limitMax?: any = undefined;
  @Input() limitValue?: any = undefined;
  @Input() type?: string;
  @Input() header?: string;
  @Input() infoBox?= false;
  @Input() virtualScoreLabel?: string;
  constructor(private modalController: ModalController) { }

  ngOnInit() {
    // console.log('limitMax', this.limitMax, 'limitValue', this.limitValue);
  }
  async openLimit(event: any) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: LimitModalPage,
      cssClass: 'challenge-info',
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
