import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { Location as LocationService } from '@angular/common';
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
  public size: IonButton['size'] = 'default';
  @Input()
  public mapButton = true;

  public transportTypeOptions$: Observable<
    {
      transportType: TransportType;
      icon: string;
    }[]
  > = this.userService.userProfileMeans$.pipe(
    map((userProfileMeans) =>
      transportTypes
        .filter((transportType) => userProfileMeans.includes(transportType))
        .map((transportType) => ({
          transportType,
          icon: transportTypeIcons[transportType],
        }))
    )
  );

  constructor(
    public tripService: TripService,
    private userService: UserService,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {}

  async changeTransportType(transportType: TransportType) {
    await this.tripService.changeTransportType(transportType);
    this.showMap();
  }
  async stop() {
    await this.tripService.stop();
    if (this.router.url === '/pages/tracking/map') {
      // or should we navigate home?
      this.locationService.back();
    }
  }
  showMap() {
    this.router.navigate(['/pages/tracking/map']);
  }
}
