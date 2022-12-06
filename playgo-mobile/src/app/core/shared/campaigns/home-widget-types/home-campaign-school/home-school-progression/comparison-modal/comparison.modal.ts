import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { PlacingComparison } from 'src/app/core/api/generated-hsc/model/placingComparison';
@Component({
  selector: 'app-comparison-modal',
  templateUrl: './comparison.modal.html',
  styleUrls: ['./comparison.modal.scss'],
})
export class ComparisonModalPage implements OnInit {
  stat: PlacingComparison;
  type: string;
  referenceDate = DateTime.local();
  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
