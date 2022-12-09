import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlacingComparison } from 'src/app/core/api/generated-hsc/model/placingComparison';
import { TeamService } from 'src/app/core/shared/services/team.service';
import { ComparisonModalPage } from './comparison-modal/comparison.modal';


@Component({
  selector: 'app-home-school-progression',
  templateUrl: './home-school-progression.component.html',
  styleUrls: ['./home-school-progression.component.scss'],
})
export class HomeSchoolProgressionComponent implements OnInit, OnDestroy {

  @Input() stat: PlacingComparison;
  @Input() type: string;

  constructor(
    private modalController: ModalController

  ) { }

  ngOnInit() {

  }


  ngOnDestroy() {
  }
  getPercentage(arg0: PlacingComparison) {
    return (arg0.value - arg0.min) > 0 ? ((arg0.max - arg0.min) / (arg0.value - arg0.min)) : 0;
  }
  async openLimit(event: any) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: ComparisonModalPage,
      cssClass: 'challenge-info',
      swipeToClose: true,
      componentProps: {
        stat: this.stat,
        type: this.type
      },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
