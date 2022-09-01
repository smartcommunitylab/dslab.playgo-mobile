import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { trackByProperty } from '../../utils';
import {
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

  public transportTypeOptions$: Observable<TrackingFabButton[]> =
    this.userService.userProfileMeans$.pipe(
      map((userProfileMeans) =>
        transportTypes
          .filter((transportType) => userProfileMeans.includes(transportType))
          .map((transportType) => ({
            transportType,
            icon: transportTypeIcons[transportType],
          }))
      )
    );

  trackTransportFabButton = trackByProperty<TrackingFabButton>('transportType');

  constructor(
    public tripService: TripService,
    private userService: UserService,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  toggleFabList() {
    // I do not know why this is necessary...  maybe related to https://github.com/ionic-team/ionic-framework/issues/19361
    // but it looks like bug in ionic.
    setTimeout(() => {
      this.fabListActive = !this.fabListActive;
      // console.log('toggleFabList', this.fabListActive);
      this.changeDetectorRef.detectChanges();
      this.fabListActivated.emit(this.fabListActive);
    }, 0);
  }

  async changeTransportType(event: Event, transportType: TransportType) {
    event.stopPropagation();
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
