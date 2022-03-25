import { Component, Input, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { MapService } from '../map/map.service';
import { TransportType } from '../trip.model';
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
  }[] = [
    { transportType: 'walk', icon: 'walk' },
    { transportType: 'bike', icon: 'bicycle' },
    { transportType: 'bus', icon: 'bus' },
    { transportType: 'car', icon: 'car' },
  ];
  constructor(public tripService: TripService, public mapService: MapService) {}

  ngOnInit() {}
}
