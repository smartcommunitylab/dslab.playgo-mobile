import { Component, OnInit } from '@angular/core';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-quick-control',
  templateUrl: './tracking-quick-control.component.html',
  styleUrls: ['./tracking-quick-control.component.scss'],
})
export class TrackingQuickControlComponent implements OnInit {
  constructor(public tripService: TripService) {}

  ngOnInit() {}
}
