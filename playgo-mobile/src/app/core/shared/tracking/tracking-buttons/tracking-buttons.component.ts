import { Component, Input, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular';
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
  @Input()
  public size: IonButton['size'] = 'default';
  @Input()
  public mapButton = true;

  public transportTypeOptions: {
    transportType: TransportType;
    icon: string;
  }[] = transportTypes.map((transportType) => ({
    transportType,
    icon: transportTypeIcons[transportType],
  }));

  constructor(public tripService: TripService, public mapService: MapService) {}

  ngOnInit() {}
}
