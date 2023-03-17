import { Injectable } from '@angular/core';
import { includes } from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  withLatestFrom,
} from 'rxjs/operators';
import { BackgroundTrackingService } from './background-tracking.service';
import { CarPoolingService } from './carpooling/carpooling.service';
import { LocationsStorageService } from './locations-storage.service';
import {
  MAX_MS_TRACKING,
  NO_TRIP_STARTED,
  TransportType,
  TripPart,
  TRIP_END,
} from './trip.model';
import { isNotConstant } from '../utils';
import { ErrorService } from '../services/error.service';
import { AlertService } from '../services/alert.service';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
/**
 * High level service, that controls staring / stopping of trip tracking, and handles
 * multimodal trips. Calls BackgroundTrackingService under the hood.
 */
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
  private stopTimerStorage =
    this.localStorageService.getStorageOf<number>('stopTimer');
  private operationInProgressSubject = new ReplaySubject();
  public operationInProgress$ = this.operationInProgressSubject.asObservable();

  public isInTrip$: Observable<boolean> = this.tripPart$.pipe(
    map(isNotConstant(TRIP_END)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(
    private tripPersistanceService: LocationsStorageService,
    private backgroundTrackingService: BackgroundTrackingService,
    private carpoolingService: CarPoolingService,
    private alertService: AlertService,
    private errorService: ErrorService,
    private localStorageService: LocalStorageService
  ) {
    console.log('constructor tripService');
    this.start();
    backgroundTrackingService.isPowerSaveMode$
      .pipe(
        withLatestFrom(this.isInTrip$),
        filter(([isPowerSaveMode, isInTrip]) => isPowerSaveMode && isInTrip),
        distinctUntilChanged()
      )
      .subscribe(() =>
        // TODO: no not work reliable
        alert('Please disable power save mode for proper location tracking')
      );
  }

  private async start() {
    try {
      const initialTrip: TripPart | NO_TRIP_STARTED =
        await this.tripPersistanceService.getInitialTrip();
      this.tripPersistanceService.storeLastOf(this.tripPart$);
      console.log('startTracking');
      console.log({ initialTrip });
      if (initialTrip === NO_TRIP_STARTED) {
        // maybe we have some location that are not synchronized with the server...
        await this.backgroundTrackingService.syncInitialLocations();
      } else {
        const validTimer = await this.setAutoStopTimer();
        console.log('validTimer', validTimer);
        if (validTimer) {
          await this.backgroundTrackingService.startTracking(initialTrip, true);
          this.setCurrentTripPart(initialTrip);
        } else {
          await this.startOrStop(TRIP_END);
        }
      }
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    }
  }

  async setAutoStopTimer() {
    console.log('setAutostoptimer');

    let stopTimer: number = await this.stopTimerStorage.get();
    if (!stopTimer) {
      stopTimer = Date.now() + MAX_MS_TRACKING;
      this.stopTimerStorage.set(stopTimer);
      console.log('set timer in storage', stopTimer);

    }
    console.log('stopTimer - Date.now()', stopTimer - Date.now());
    if (stopTimer - Date.now() > 0) {
      setTimeout(async () => await this.startOrStop(TRIP_END), stopTimer - Date.now());
      console.log('setTimeout', stopTimer - Date.now());

      return true;
    }
    else {
      return false;
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
      const isNewTrip = includes(
        [NO_TRIP_STARTED, TRIP_END],
        this.currentTripPart
      );
      const newTripPart = this.getNewTripPart(
        lastTripPartWithId,
        tripPartWithoutMultimodalId
      );

      if (newTripPart !== TRIP_END && newTripPart.transportType === 'car') {
        newTripPart.sharedTravelId =
          await this.carpoolingService.startCarPoolingTrip();
      }

      if (newTripPart === TRIP_END) {
        await this.backgroundTrackingService.stopTracking();
        this.stopTimerStorage.clear();
      } else {
        console.log('startOrStop');

        await this.backgroundTrackingService.startTracking(
          newTripPart,
          isNewTrip
        );
        this.setAutoStopTimer();
      }
      this.setCurrentTripPart(newTripPart);
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    } finally {
      this.operationInProgressSubject.next(false);
    }
  }
  private setCurrentTripPart(newTripPart: TripPart | TRIP_END) {
    this.currentTripPart = newTripPart;
    this.tripPartSubject.next(this.currentTripPart);
  }
}
