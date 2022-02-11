/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { concat, EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import {
  filter,
  mergeScan,
  scan,
  shareReplay,
  withLatestFrom,
} from 'rxjs/operators';
import { TripPersistanceService } from './trip-persistance.service';
import { isNotConstant } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private tripPartsSubject$ = new ReplaySubject<TripPart | TRIP_END>();

  public tripPart$: Observable<TripPart | TRIP_END> = concat(
    this.getInitialTrip(),
    this.tripPartsSubject$
  ).pipe(shareReplay(1));

  public trip$: Observable<Trip | TRIP_END> = this.tripPart$.pipe(
    mergeScan((lastTrip, currentTripPart) => {
      if (currentTripPart === TRIP_END) {
        // we received trip part end event -> end also the trip.
        return of(TRIP_END);
      }
      if (lastTrip !== TRIP_END) {
        // there is ongoing trip -> continue with that one.
        return EMPTY;
      }
      // we have new tripPart, but no trip ongoing -> create one.
      return of(Trip.fromFirstPart(currentTripPart));
    }, NO_TRIP_STARTED as Trip | TRIP_END | NO_TRIP_STARTED),
    filter(isNotConstant(NO_TRIP_STARTED))
  );

  public tripStart$: Observable<Trip> = this.trip$.pipe(
    filter(isNotConstant(TRIP_END))
  );

  public tripEnd$: Observable<Trip> = this.trip$.pipe(
    scan((lastTrip, currentTripOrEnd) => {
      if (isNotConstant(TRIP_END)(currentTripOrEnd)) {
        return currentTripOrEnd;
      }
      return lastTrip;
    }, NO_TRIP_STARTED as NO_TRIP_STARTED | Trip),
    filter(isNotConstant(NO_TRIP_STARTED))
  );

  constructor(private tripPersistanceService: TripPersistanceService) {
    this.tripPersistanceService.storeLastOf(this.tripPart$);
  }

  public changeMean(mean: Mean) {
    this.tripPartsSubject$.next(TripPart.fromMean(mean));
  }

  public stop() {
    this.tripPartsSubject$.next(TRIP_END);
  }

  private getInitialTrip(): Observable<TripPart>{
    return this.tripPersistanceService.initialTrip$;
  }
  // setInitialTrip(initialTrip: TripPart | NO_TRIP_STARTED): void {
  //   if (initialTrip !== NO_TRIP_STARTED) {
  //     this.tripPartsSubject$.next(initialTrip);
  //   }
  // }
}

export class Trip {
  tripId: string;
  constructor(data?: Trip) {
    Object.assign(this, data || {});
  }
  public static fromFirstPart(firstPart: TripPart): Trip {
    const tripId = `${firstPart.mean}_${firstPart.started}`;
    return new Trip({ tripId });
  }
}

export class TripPart {
  mean: Mean;
  multimodalId: string;
  started: number;
  constructor(data?: TripPart) {
    Object.assign(this, data || {});
  }
  public static fromMean(mean: Mean): TripPart {
    const started = new Date().getTime();
    return new TripPart({
      started,
      mean,
      multimodalId: `multimodal_${started}`,
    });
  }
}

export type Mean = 'walk' | 'bicycle' | 'bus';

export const TRIP_END = 'TRIP_END' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type TRIP_END = typeof TRIP_END;

export const NO_TRIP_STARTED = 'NO_TRIP_STARTED' as const;
// eslint-disable-next-line @typescript-eslint/naming-convention
export type NO_TRIP_STARTED = typeof NO_TRIP_STARTED;

// const isNotTripEnd = <T>(arg: T | TRIP_END): arg is T => arg !== TRIP_END;
// const isNotNoTripStarted = <T>(arg: T | NO_TRIP_STARTED): arg is T => arg !== NO_TRIP_STARTED;
