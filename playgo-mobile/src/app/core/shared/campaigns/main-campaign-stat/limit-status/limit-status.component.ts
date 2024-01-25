import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LimitModalPage } from './limit-modal/limit.modal';
import { UserService } from '../../../services/user.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';

@Component({
  selector: 'app-limit-status',
  templateUrl: './limit-status.component.html',
  styleUrls: ['./limit-status.component.scss'],
})
export class LimitStatusComponent implements OnInit {
  @Input() campaign?: Campaign = undefined;
  @Input() limitMax?: any = undefined;
  @Input() limitValue?: any = undefined;
  @Input() type?: string;
  @Input() header?: string;
  @Input() infoBox?= false;
  @Input() virtualScoreLabel?: string;
  constructor(private modalController: ModalController, private userService: UserService) { }

  ngOnInit() {
    // console.log('limitMax', this.limitMax, 'limitValue', this.limitValue);
  }
  async openLimit(event: any) {
    event.stopPropagation();
    const language = this.userService.getLanguage();
    const modal = await this.modalController.create({
      component: LimitModalPage,
      componentProps: {
        campaign: this.campaign,
        language,
      },
      cssClass: 'challenge-info',
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
