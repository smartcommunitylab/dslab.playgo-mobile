import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthHttpService } from 'src/app/core/auth/auth-http.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { Trip } from 'src/app/core/shared/tracking/trip.model';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
})
export class TripDetailPage implements OnInit {
  trip: TripDetail = null;

  constructor(
    private route: ActivatedRoute,
    private authHttpService: AuthHttpService,
    private errorService: ErrorService
  ) {}

  async ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      try {
        this.trip = await this.getTripDetail(tripId);
      } catch (e) {
        // TODO: incorrect id handling
        this.errorService.showAlert(e);
      }
    }
    console.log(tripId, this.trip);
  }
  // TODO: move to service
  async getTripDetail(id: string): Promise<TripDetail> {
    return this.authHttpService.request('GET', `/track/player/${id}`);
  }
}
interface TripDetail {
  trackedInstanceId: string;
  multimodalId: string;
  startTime: number;
  endTime: number;
  modeType: string; //'BIKE';
  distance: number;
  validity: 'VALID' | 'INVALID';
  campaigns: [];
  polyline: string;
}
