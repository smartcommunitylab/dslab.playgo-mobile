import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { MapService } from '../map/map.service';
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
    public mapService: MapService,
    private userService: UserService
  ) {}

  ngOnInit() {}
}
