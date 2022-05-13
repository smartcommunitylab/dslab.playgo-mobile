import { async, TestBed, waitForAsync } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { TrackControllerService } from '../../api/generated/controllers/trackController.service';
import { PageTrackedInstanceInfo } from '../../api/generated/model/pageTrackedInstanceInfo';
import {
  LocalStorageService,
  LocalStorageType,
} from '../local-storage.service';
import { UnwrapArray, UnwrapObservable } from '../type.utils';

import { LocalTripsService } from './local-trips.service';

fdescribe('LocalTripsService', () => {
  const debugRefTime = DateTime.now();
  const initialTripsStub: Trip[] = [
    {
      status: 'syncButNotReturnedFromServer',
      trackedInstanceId: '0',
      date: debugRefTime.minus({ days: 2 }).toISO(),
    },
    {
      status: 'returnedFromServer',
      trackedInstanceId: '1',
      data: 'one',
      date: debugRefTime.minus({ days: 1 }).toISO(),
    },
  ];

  let localTripsService: LocalTripsService;
  let storageMock: jasmine.SpyObj<LocalStorageOfTrips>;
  let trackControllerServiceStub: jasmine.SpyObj<TrackControllerService>;
  beforeEach(() => {
    storageMock = jasmine.createSpyObj('LocalStorage', ['get', 'set']);
    storageMock.get.and.returnValue(initialTripsStub);

    trackControllerServiceStub = jasmine.createSpyObj(
      'TrackControllerService',
      ['getTrackedInstanceInfoListUsingGET']
    );

    const emptyServerResult: PageTrackedInstanceInfo = {
      content: [],
    };
    trackControllerServiceStub.getTrackedInstanceInfoListUsingGET.and.returnValue(
      of(emptyServerResult)
    );

    TestBed.configureTestingModule({
      providers: [
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
    expect(storageMock.get).toHaveBeenCalled();
  });

  it(
    'initial data should be triggered',
    waitForAsync(async () => {
      const firstDataReported = await localTripsService.localDataChanges$
        .pipe(take(1))
        .toPromise();
      expect(firstDataReported).toEqual(initialTripsStub as any);
    })
  );

  it('On the app start soft trigger should cause calling of api, if we have pending trips', () => {
    expect(
      trackControllerServiceStub.getTrackedInstanceInfoListUsingGET
    ).toHaveBeenCalled();
  });
  it('soft trigger should reload only pending trips', () => {});
  it('hard trigger should reload whole period', () => {});

  it('should store trips to storage', () => {});
});

// we do not want to export internal types, so lets derive them from the exposed ones
type Trip = UnwrapArray<
  UnwrapObservable<LocalTripsService['localDataChanges$']>
>;
type LocalStorageOfTrips = LocalStorageType<Trip[]>;

//T extends Observable<infer U> ? U : never;
