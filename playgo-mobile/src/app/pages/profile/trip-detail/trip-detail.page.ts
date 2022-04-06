import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { flatMap } from 'lodash-es';
import { AuthHttpService } from 'src/app/core/auth/auth-http.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import {
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
})
export class TripDetailPage implements OnInit {
  tripDetails: TripDetail[] = null;
  campaigns: TripCampaign[];
  showMap: boolean;
  transportTypeIcons = transportTypeIcons;
  transportTypeLabels = transportTypeLabels;

  constructor(
    private route: ActivatedRoute,
    private authHttpService: AuthHttpService,
    private errorService: ErrorService
  ) {}

  async ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      try {
        const singleTripDetail = await this.getTripDetail(tripId);
        this.tripDetails = [singleTripDetail];
        this.showMap = this.tripDetails.some((trip) => trip.polyline);
        this.campaigns = flatMap(this.tripDetails, (trip) => trip.campaigns);
      } catch (e) {
        // TODO: incorrect id handling
        this.errorService.showAlert(e);
      }
    }
  }
  // TODO: move to service
  async getTripDetail(id: string): Promise<TripDetail> {
    return await this.authHttpService.request<TripDetail>(
      'GET',
      `/track/player/${id}`
    );
  }
}
export interface TripDetail {
  trackedInstanceId: string;
  multimodalId: string;
  startTime: number;
  endTime: number;
  modeType: string; //'BIKE';
  distance: number;
  validity: 'VALID' | 'INVALID';
  campaigns: TripCampaign[];
  polyline: string;
}
export interface TripCampaign {
  campaignId: string;
  campaignName: string;
  score: number;
  valid: boolean;
}
