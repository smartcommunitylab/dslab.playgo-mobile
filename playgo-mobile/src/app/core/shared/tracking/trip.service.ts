/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { filter, map, mergeScan, scan, shareReplay } from 'rxjs/operators';
import { BackgroundTrackingService } from './background-tracking.service';
import { TripPersistanceService } from './trip-persistance.service';
import {
  TransportType,
  NO_TRIP_STARTED,
  Trip,
  TripPart,
  TRIP_END,
} from './trip.model';
import { isNotConstant, tapLog } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private currentTripPart: TripPart | TRIP_END | NO_TRIP_STARTED =
    NO_TRIP_STARTED;
  private tripPartSubject = new ReplaySubject<TripPart | TRIP_END>();

  public tripPart$: Observable<TripPart | TRIP_END> =
    this.tripPartSubject.asObservable();

  public trip$: Observable<Trip | TRIP_END> = this.tripPart$.pipe(
    // tapLog('trip$ before mergeScan'),
    mergeScan((lastTrip, currentTripPart) => {
      // console.log('trip$ in mergeScan', lastTrip, currentTripPart);
      if (currentTripPart === TRIP_END) {
        // we received trip part end event -> end also the trip.
        // console.log(
        //   'we received trip part end event -> end also the trip.',
        //   TRIP_END
        // );
        return of(TRIP_END);
      }
      if (lastTrip !== TRIP_END && lastTrip !== NO_TRIP_STARTED) {
        // there is ongoing trip -> continue with that one.
        // console.log('there is ongoing trip -> continue with that one.', '--');
        return EMPTY;
      }
      // we have new tripPart, but no trip ongoing -> create one.
      const newTrip = Trip.fromFirstPart(currentTripPart);
      // console.log(
      //   'we have new tripPart, but no trip ongoing -> create one.',
      //   newTrip
      // );
      return of(newTrip);
    }, NO_TRIP_STARTED as Trip | TRIP_END | NO_TRIP_STARTED),
    // tapLog('trip$ after mergeScan'),
    filter(isNotConstant(NO_TRIP_STARTED)),
    shareReplay(1)
  );

  public isInTrip$: Observable<boolean> = this.trip$.pipe(
    map(isNotConstant(TRIP_END))
  );

  public tripStart$: Observable<Trip> = this.trip$.pipe(
    filter(isNotConstant(TRIP_END))
  );

  public tripEnd$: Observable<Trip> = this.trip$.pipe(
    scan(
      (lastTripInfo, currentTripOrEnd) => {
        if (currentTripOrEnd === TRIP_END) {
          return {
            trip: lastTripInfo.trip,
            isEnd: true,
          };
        }
        return {
          trip: currentTripOrEnd,
          isEnd: false,
        };
      },
      {
        isEnd: false,
        trip: NO_TRIP_STARTED as NO_TRIP_STARTED | Trip,
      }
    ),
    filter(({ isEnd }) => isEnd),
    map(({ trip }) => trip),
    filter(isNotConstant(NO_TRIP_STARTED))
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

  public async changeMean(mean: TransportType) {
    await this.startOrStop(TripPart.fromTransportType(mean));
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
    }
  }
  private setCurrentTripPart(newTripPart: TripPart | TRIP_END) {
    this.currentTripPart = newTripPart;
    this.tripPartSubject.next(this.currentTripPart);
  }
}
