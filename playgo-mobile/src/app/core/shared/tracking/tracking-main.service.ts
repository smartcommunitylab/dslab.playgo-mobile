import { Injectable } from '@angular/core';
import { BackgroundTrackingService } from './background-tracking.service';
import { TripPersistanceService } from './trip-persistance.service';

@Injectable({
  providedIn: 'root',
})
export class TrackingMainService {
  constructor(
    private backgroundTrackingService: BackgroundTrackingService,
    private tripPersistanceService: TripPersistanceService
  ) {}
  start() {
    console.log('starting all tracking related services');
    this.backgroundTrackingService.start();
    this.tripPersistanceService.start();
  }
}
