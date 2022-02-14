import { Component, OnInit } from '@angular/core';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent implements OnInit {

  constructor( public tripService: TripService) { }

  ngOnInit() {}

}
