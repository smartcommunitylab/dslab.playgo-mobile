import { Component, Input, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { TransportType } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent implements OnInit {
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
