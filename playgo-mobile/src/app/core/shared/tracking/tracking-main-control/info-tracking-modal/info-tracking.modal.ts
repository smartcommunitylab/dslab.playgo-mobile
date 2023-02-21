import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { CampaignService } from '../../../services/campaign.service';
import { TrackingFabButton } from '../../tracking-buttons/tracking-buttons.component';
import { getTransportTypeLabel, transportTypeIcons } from '../../trip.model';
@Component({
  selector: 'app-info-tracking-modal',
  templateUrl: './info-tracking.modal.html',
  styleUrls: ['./info-tracking.modal.scss'],
})
export class InfoTrackingModalPage implements OnInit {
  getTransportTypeLabel = getTransportTypeLabel;
  public transportTypeOptions$: Observable<TrackingFabButton[]> =
    this.campaignService.availableMeans$.pipe(
      map((means) =>
        means.map((transportType) => ({
          transportType,
          icon: transportTypeIcons[transportType],
        }))
      )
    );
  constructor(private modalController: ModalController, private campaignService: CampaignService) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
