import { Component } from '@angular/core';
import { TripPersistanceService } from '../tracking/trip-persistance.service';
import { TripService } from '../tracking/trip.service';

@Component({
  selector: 'app-hello',
  templateUrl: 'hello.component.html',
  styleUrls: ['hello.component.css'],
})
export class HelloComponent {
  constructor(
    private tripService: TripService,
    private tripPersistanceService: TripPersistanceService
  ) {
    // I dont like this at all...
    this.tripPersistanceService.init();
  }
}
