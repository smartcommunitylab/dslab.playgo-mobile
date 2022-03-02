import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { BackgroundTrackingService } from './background-tracking.service';
import { TripPersistanceService } from './trip-persistance.service';
import {
  NO_TRIP_STARTED,
  TransportType,
  TripPart,
  TRIP_END,
} from './trip.model';
import { isNotConstant } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private currentTripPart: TripPart | TRIP_END | NO_TRIP_STARTED =
    NO_TRIP_STARTED;
  private tripPartSubject = new ReplaySubject<TripPart | TRIP_END>();

  public tripPart$: Observable<TripPart | TRIP_END> =
    this.tripPartSubject.asObservable();

  public activeTransportType$ = this.tripPart$.pipe(
    map((tripPart) => {
      if (tripPart === TRIP_END) {
        return null;
      }
      return tripPart.transportType;
    })
  );

  private operationInProgressSubject = new ReplaySubject();
  public operationInProgress$ = this.operationInProgressSubject.asObservable();

  public isInTrip$: Observable<boolean> = this.tripPart$.pipe(
    map(isNotConstant(TRIP_END)),
    distinctUntilChanged()
  );

  constructor(
    private tripPersistanceService: TripPersistanceService,
    private backgroundTrackingService: BackgroundTrackingService
  ) {
    this.start();
  }

  private async start() {
    try {
      const initialTrip: TripPart | NO_TRIP_STARTED =
        this.tripPersistanceService.getInitialTrip();
      this.tripPersistanceService.storeLastOf(this.tripPart$);

      console.log({ initialTrip });
      if (initialTrip === NO_TRIP_STARTED) {
        // maybe we have some location that are not synchronized with the server...
        await this.backgroundTrackingService.syncInitialLocations();
      } else {
        await this.backgroundTrackingService.startTracking(initialTrip);
        this.setCurrentTripPart(initialTrip);
      }
    } catch (e) {
      console.error(e);
    }
  }

  public async changeTransportType(transportType: TransportType) {
    await this.startOrStop(TripPart.fromTransportType(transportType));
  }

  public async stop() {
    await this.startOrStop(TRIP_END);
  }

  private getNewTripPart(
    lastTripPart: TripPart | NO_TRIP_STARTED | TRIP_END,
    currentTripPart: TripPart | TRIP_END
  ) {
    if (currentTripPart === TRIP_END) {
      return TRIP_END;
    }
    let multimodalId: string;
    if (lastTripPart === TRIP_END || lastTripPart === NO_TRIP_STARTED) {
      // creating a new trip
      multimodalId = `multimodal_${currentTripPart.start}`;
    } else {
      // continue with previous multimodalId
      multimodalId = lastTripPart.multimodalId;
    }

    return new TripPart({
      ...currentTripPart,
      multimodalId,
    });
  }
  private async startOrStop(
    tripPartWithoutMultimodalId: TripPart | TRIP_END
  ): Promise<void> {
    try {
      this.operationInProgressSubject.next(true);
      const lastTripPartWithId = this.currentTripPart;
      const newTripPart = this.getNewTripPart(
        lastTripPartWithId,
        tripPartWithoutMultimodalId
      );
      if (newTripPart === TRIP_END) {
        await this.backgroundTrackingService.stopTracking();
      } else {
        await this.backgroundTrackingService.startTracking(newTripPart);
      }
      this.setCurrentTripPart(newTripPart);
    } catch (e) {
      console.error(e);
    } finally {
      this.operationInProgressSubject.next(false);
    }
  }
  private setCurrentTripPart(newTripPart: TripPart | TRIP_END) {
    this.currentTripPart = newTripPart;
    this.tripPartSubject.next(this.currentTripPart);
  }
}
