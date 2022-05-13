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

import { InitServiceStream, LocalTripsService } from './local-trips.service';

fdescribe('LocalTripsService', () => {
  const debugRefTime = DateTime.now();

  const tripsStub = {
    empty: [] as Trip[],
    onePendingAndOneReturned: [
      {
        status: 'syncButNotReturnedFromServer',
        trackedInstanceId: '0',
        date: debugRefTime.minus({ days: 2 }).toISO(),
      },
      {
        status: 'returnedFromServer',
        trackedInstanceId: '1',
        date: debugRefTime.minus({ days: 1 }).toISO(),
      },
    ] as Trip[],
  };

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

  it(
    'initial data should be triggered',
    waitForAsync(async () => {
      prepareService({ storageData: tripsStub.onePendingAndOneReturned });

      const firstDataReported = await localTripsService.localDataChanges$
        .pipe(first())
        .toPromise();
      expect(firstDataReported).toEqual(
        tripsStub.onePendingAndOneReturned as any
      );
    })
  );

  it('On the app start soft trigger should cause calling of api, if we have pending trips', () => {
    prepareService({ storageData: tripsStub.onePendingAndOneReturned });
    expect(
      trackControllerServiceStub.getTrackedInstanceInfoListUsingGET
    ).toHaveBeenCalled();
  });

  it(
    'Data from server should be merged with local data - add new',
    waitForAsync(async () => {
      const newData: Trip = {
        trackedInstanceId: '2',
        date: debugRefTime.minus({ days: 0.5 }).toISO(),
        status: 'returnedFromServer',
      };

      prepareService({
        storageData: tripsStub.onePendingAndOneReturned,
        firstServerData: [newData],
      });

      const reportedData = await localTripsService.localDataChanges$
        .pipe(second())
        .toPromise();

      expect(reportedData.length).toEqual(3);
      expect(reportedData[2]).toEqual(newData);
    })
  );

  it(
    'Data from server should be merged with local data - skip present',
    waitForAsync(async () => {
      prepareService({
        storageData: tripsStub.onePendingAndOneReturned,
        firstServerData: [tripsStub.onePendingAndOneReturned[1]],
      });

      const reportedData = await localTripsService.localDataChanges$
        .pipe(second())
        .toPromise();

      expect(reportedData.length).toEqual(2);
      expect(reportedData).toEqual(tripsStub.onePendingAndOneReturned as any);
    })
  );
  it(
    'Data from server should be merged with local data - merge pending',
    waitForAsync(async () => {
      prepareService({
        storageData: tripsStub.onePendingAndOneReturned,
        firstServerData: [
          {
            status: null,
            trackedInstanceId: '0',
            date: debugRefTime.minus({ days: 2 }).toISO(),
          },
        ],
      });

      const reportedData = await localTripsService.localDataChanges$
        .pipe(second())
        .toPromise();

      expect(reportedData.length).toEqual(2);
      expect(reportedData[0]).toEqual({
        status: 'returnedFromServer',
        trackedInstanceId: '0',
        date: debugRefTime.minus({ days: 2 }).toISO(),
      });
    })
  );
  it('soft trigger should reload only pending trips', () => {});
  it('hard trigger should reload whole period', () => {});

  it('should store trips to storage', () => {});

  function prepareService(opts: {
    storageData?: Trip[];
    firstServerData?: Trip[];
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

function asServerData(trips: Trip[]): Observable<PageTrackedInstanceInfo> {
  const mockedResponse = {
    content: trips.map((t) => ({
      trackedInstanceId: t.trackedInstanceId,
      endTime: t.date as unknown as Date,
      status: 'returnedFromServer',
    })),
  };

  return of(mockedResponse).pipe(
    delay(0),
    tapLog('TEST: Returning mocked data created from trips: ', trips)
  );
}

const second = <T>() => elementAt<T>(1);

// we do not want to export internal types, so lets derive them from the exposed ones
type Trip = UnwrapArray<
  UnwrapObservable<LocalTripsService['localDataChanges$']>
>;
type LocalStorageOfTrips = LocalStorageType<Trip[]>;

//T extends Observable<infer U> ? U : never;
