import { Injectable } from '@angular/core';
import { BackgroundTrackingService } from './background-tracking.service';

@Injectable({
  providedIn: 'root',
})
export class TrackingMainService {
  constructor(private backgroundTrackingService: BackgroundTrackingService) {}
  start() {
    console.log('starting all tracking related services');
    this.backgroundTrackingService.start();
  }
}
