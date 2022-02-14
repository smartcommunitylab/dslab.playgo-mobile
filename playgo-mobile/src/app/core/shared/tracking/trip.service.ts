/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { concat, EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import {
  filter,
  map,
  mergeScan,
  scan,
  shareReplay,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';
import { TripPersistanceService } from './trip-persistance.service';
import { Mean, NO_TRIP_STARTED, Trip, TripPart, TRIP_END } from './trip.model';
import { isNotConstant, tapLog } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private tripPartsSubject$ = new ReplaySubject<TripPart | TRIP_END>();

  public tripPart$: Observable<TripPart | TRIP_END> = concat(
    this.getInitialTripPart(),
    this.tripPartsSubject$
  ).pipe(shareReplay(1));

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
      // FIXME: if we have ongoing trip in the local storage, we should use that trip ID!!!!
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

  private getInitialTripPart(): Observable<TripPart> {
    return this.tripPersistanceService.initialTrip$;
  }
}
