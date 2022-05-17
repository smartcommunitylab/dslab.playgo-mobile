/// <reference types="jasmine-expect" />

/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { async, TestBed, waitForAsync } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Observable, of, Subject } from 'rxjs';
import { delay, elementAt, first } from 'rxjs/operators';
import { TrackControllerService } from '../../api/generated/controllers/trackController.service';
import { PageTrackedInstanceInfo } from '../../api/generated/model/pageTrackedInstanceInfo';
import { TrackedInstanceInfo } from '../../api/generated/model/trackedInstanceInfo';
import {
  LocalStorageService,
  LocalStorageType,
} from '../local-storage.service';
import { UnwrapArray, UnwrapObservable } from '../type.utils';
import { tapLog } from '../utils';

import {
  InitServiceStream,
  LocalTripsService,
  StorableTrip,
} from './local-trips.service';

describe('LocalTripsService', () => {
  const debugRefTime = DateTime.now();
  const oneDayAgo = debugRefTime.minus({ days: 1 }).toUTC().toISO();
  const twoDaysAgo = debugRefTime.minus({ days: 2 }).toUTC().toISO();
  const threeDaysAgo = debugRefTime.minus({ days: 3 }).toUTC().toISO();

  const tripsStub = (() => {
    const onePendingAndOneReturned: StorableTrip[] = [
      {
        status: 'syncedButNotReturnedFromServer',
        id: 'id_of_trip_three_days_ago',
        date: threeDaysAgo,
      },
      {
        status: 'fromServer',
        id: 'id_of_trip_two_days_ago',
        date: twoDaysAgo,
      },
    ];
    const empty: StorableTrip[] = [];
    return { empty, onePendingAndOneReturned } as const;
  })();

  let localTripsService: LocalTripsService;
  let storageMock: jasmine.SpyObj<LocalStorageOfTrips>;
  let trackControllerServiceStub: jasmine.SpyObj<TrackControllerService>;
  let serviceInitTriggerSubject: Subject<void>;

  beforeEach(() => {
    storageMock = jasmine.createSpyObj('LocalStorage', ['get', 'set']);

    trackControllerServiceStub = jasmine.createSpyObj(
      'TrackControllerService',
      ['getTrackedInstanceInfoListUsingGET']
    );

    serviceInitTriggerSubject = new Subject<void>();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: InitServiceStream,
          useValue: {
            get: () => serviceInitTriggerSubject,
          },
        },
        {
          provide: LocalStorageService,
          useValue: {
            getStorageOf: () => storageMock,
          },
        },
        {
          provide: TrackControllerService,
          useValue: trackControllerServiceStub,
        },
      ],
    });

    localTripsService = TestBed.inject(LocalTripsService);
  });

  it('should be created', () => {
    expect(localTripsService).toBeTruthy();
  });

  // it('test fail', () => {
  //   expect(false).toBeTruthy();
  // });

  it('initial data from storage should be read', () => {
    prepareService({});
    expect(storageMock.get).toHaveBeenCalled();
  });

  it('initial data should be triggered', waitForAsync(async () => {
    prepareService({ storageData: tripsStub.onePendingAndOneReturned });

    const firstDataReported = await localTripsService.localDataChanges$
      .pipe(first())
      .toPromise();
    expect(firstDataReported).toEqual(
      tripsStub.onePendingAndOneReturned as any
    );
  }));

  it('On the app start soft trigger should cause calling of api, if we have pending trips', () => {
    prepareService({ storageData: tripsStub.onePendingAndOneReturned });
    expect(
      trackControllerServiceStub.getTrackedInstanceInfoListUsingGET
    ).toHaveBeenCalled();
  });

  it('Data from server should be merged with local data - add new', waitForAsync(async () => {
    const newData: ServerTripStub = {
      id: 'id_of_new_trip_one_day_ago',
      date: oneDayAgo,
    };

    prepareService({
      storageData: tripsStub.onePendingAndOneReturned,
      firstServerData: [newData],
    });

    const reportedData = await localTripsService.localDataChanges$
      .pipe(second())
      .toPromise();

    expect(reportedData).toBeArrayOfSize(3);
    expect(reportedData[2]).toEqual(
      jasmine.objectContaining({
        id: 'id_of_new_trip_one_day_ago',
        date: oneDayAgo,
        status: 'fromServer',
      } as Partial<StorableTrip>)
    );
  }));

  it('Data from server should be merged with local data - skip present', waitForAsync(async () => {
    prepareService({
      storageData: tripsStub.onePendingAndOneReturned,
      firstServerData: [tripsStub.onePendingAndOneReturned[1]],
    });

    const reportedData = await localTripsService.localDataChanges$
      .pipe(second())
      .toPromise();

    expect(reportedData).toBeArrayOfSize(2);
    expect(reportedData).toEqual(
      tripsStub.onePendingAndOneReturned.map(jasmine.objectContaining)
    );
  }));

  it('Data from server should be merged with local data - merge pending', waitForAsync(async () => {
    prepareService({
      storageData: tripsStub.onePendingAndOneReturned,
      firstServerData: [
        {
          id: 'id_of_trip_three_days_ago',
          date: threeDaysAgo,
        },
      ],
    });

    const reportedData = await localTripsService.localDataChanges$
      .pipe(second())
      .toPromise();

    expect(reportedData).toBeArrayOfSize(2);
    expect(reportedData[0]).toEqual(
      jasmine.objectContaining({
        status: 'fromServer',
        id: 'id_of_trip_three_days_ago',
        date: threeDaysAgo,
      } as Partial<StorableTrip>)
    );
  }));

  it('soft trigger should reload only pending trips', () => {});

  it('hard trigger should reload whole period', () => {});

  it('should store trips to storage', () => {});

  function prepareService(opts: {
    storageData?: StorableTrip[];
    firstServerData?: ServerTripStub[];
    runInit?: boolean;
  }) {
    storageMock.get.and.returnValue(opts.storageData || null);
    trackControllerServiceStub.getTrackedInstanceInfoListUsingGET.and.returnValue(
      asServerData(opts.firstServerData || [])
    );

    if (opts.runInit !== false) {
      serviceInitTriggerSubject.next();
    }
  }
});

function asServerData(
  trips: ServerTripStub[]
): Observable<PageTrackedInstanceInfo> {
  const mockedResponse = {
    content: trips.map((t) => ({
      clientId: t.id,
      endTime: t.date as unknown as Date,
      status: 'returnedFromServer',
    })),
  };

  return of(mockedResponse).pipe(
    delay(0),
    tapLog('TEST: Returning mocked data created from trips: ', trips)
  );
}

interface ServerTripStub {
  id: string;
  date: string;
}
const second = <T>() => elementAt<T>(1);

type LocalStorageOfTrips = LocalStorageType<StorableTrip[]>;

//T extends Observable<infer U> ? U : never;
