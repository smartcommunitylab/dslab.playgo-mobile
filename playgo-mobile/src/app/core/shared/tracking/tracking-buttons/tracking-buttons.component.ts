import { Component, Input, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular';
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
  public transportTypeOptions: {
    transportType: TransportType;
    icon: string;
  }[] = [
    { transportType: 'walk', icon: 'walk' },
    { transportType: 'bicycle', icon: 'bicycle' },
    { transportType: 'bus', icon: 'bus' },
    { transportType: 'car', icon: 'car' },
  ];
  constructor(public tripService: TripService) {}

  ngOnInit() {}
}
