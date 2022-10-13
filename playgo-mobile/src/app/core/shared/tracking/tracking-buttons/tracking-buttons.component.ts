import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { CampaignService } from '../../services/campaign.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { UserService } from '../../services/user.service';
import { trackByProperty, waitMs } from '../../utils';
import { BackgroundTrackingService } from '../background-tracking.service';
import { FirstTimeBackgrounModalPage } from '../first-time-modal/first-time.modal';
import {
  ACCESS_DENIED,
  TransportType,
  transportTypeIcons,
  transportTypes,
} from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-buttons',
  templateUrl: './tracking-buttons.component.html',
  styleUrls: ['./tracking-buttons.component.scss'],
})
export class TrackingButtonsComponent implements OnInit {
  @Input()
  fabListActive = false;
  @Output()
  fabListActivated = new EventEmitter<boolean>();

  inProgressButton: TransportType | 'stop' = null;

  hasPermissions: boolean = null;

  public transportTypeOptions$: Observable<TrackingFabButton[]> =
    this.campaignService.availableMeans$.pipe(
      map((means) =>
        means.map((transportType) => ({
          transportType,
          icon: transportTypeIcons[transportType],
        }))
      )
    );

  trackTransportFabButton = trackByProperty<TrackingFabButton>('transportType');
  constructor(
    public tripService: TripService,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async toggleFabList() {
    await this.openOrCloseFabList(!this.fabListActive);
  }
  private async openOrCloseFabList(open: boolean) {
    // I do not know why wait and detect changes is necessary...
    // maybe related to https://github.com/ionic-team/ionic-framework/issues/19361
    // but it looks like bug in ionic.
    await waitMs(0);
    this.fabListActive = open;
    await waitMs(0);
    this.fabListActivated.emit(this.fabListActive);
    this.changeDetectorRef.detectChanges();
  }

  async changeTransportType(
    event: Event,
    transportType: TransportType,
    fabButtonState: 'disabled' | 'enabled'
  ) {
    event.stopPropagation();

    // https://github.com/ionic-team/ionic-framework/issues/14719
    if (fabButtonState === 'disabled') {
      return;
    }

    this.inProgressButton = transportType;
    try {
      await this.tripService.changeTransportType(transportType);
    } finally {
      this.inProgressButton = transportType;
    }
  }

  async stop(event: Event) {
    event.stopPropagation();
    this.inProgressButton = 'stop';
    try {
      await this.tripService.stop();
      await this.alertService.presentAlert({
        headerTranslateKey: 'tracking.stop_header',
        messageTranslateKey: 'tracking.stop_body',
      });
    } finally {
      this.inProgressButton = null;
    }
  }

  ngOnInit() {}
}

type TrackingFabButton = {
  transportType: TransportType;
  icon: string;
};
