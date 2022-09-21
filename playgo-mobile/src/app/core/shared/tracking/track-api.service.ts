import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { TrackControllerService } from '../../api/generated/controllers/trackController.service';
import { PageTrackedInstanceInfo } from '../../api/generated/model/pageTrackedInstanceInfo';
import { TrackedInstanceInfo } from '../../api/generated/model/trackedInstanceInfo';
import { TransportType, transportTypes } from './trip.model';

@Injectable({
  providedIn: 'root',
})
export class TrackApiService {
  constructor(private trackControllerService: TrackControllerService) {}

  public getTrackedInstanceInfoList(args: {
    page: number;
    size: number;
    dateFrom?: number;
    sort?: string;
    dateTo?: number;
    campaignId?: string;
  }) {
    return this.trackControllerService
      .getTrackedInstanceInfoListUsingGET(args)
      .pipe(map((response) => this.normalizeTripsResponse(response)));
  }

  async getTrackedInstanceInfoDetail(id: string): Promise<TrackedInstanceInfo> {
    const trip = await firstValueFrom(
      this.trackControllerService.getTrackedInstanceInfoUsingGET1({
        trackedInstanceId: id,
      })
    );
    return this.normalizeTrip(trip);
  }

  private normalizeTripsResponse(
    response: PageTrackedInstanceInfo
  ): PageTrackedInstanceInfo {
    return {
      ...response,
      content: response?.content?.map((trip) => this.normalizeTrip(trip)),
    };
  }
  private normalizeTrip(trip: TrackedInstanceInfo) {
    if (!trip) {
      return trip;
    }
    return {
      ...trip,
      modeType: this.getTripMode(trip),
    };
  }

  private getTripMode(trip: TrackedInstanceInfo): TransportType {
    const unknownMode: TransportType = 'unknown';
    if (!trip) {
      return unknownMode;
    }
    if (trip.modeType) {
      return trip.modeType as TransportType;
    }
    const modeFromId = transportTypes.find((eachType) =>
      trip?.clientId?.startsWith(eachType + '_')
    );
    if (modeFromId) {
      return modeFromId;
    }
    return unknownMode;
  }
}
