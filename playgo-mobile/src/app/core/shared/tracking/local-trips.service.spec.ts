import { async, TestBed, waitForAsync } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
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
      id: 0,
      date: debugRefTime.minus({ days: 1 }).toJSDate(),
    },
    {
      status: 'returnedFromServer',
      id: 1,
      data: 'one',
      date: debugRefTime.minus({ days: 2 }).toJSDate(),
    },
  ];

  let localTripsService: LocalTripsService;
  let storageMock: jasmine.SpyObj<LocalStorageOfTrips>;

  beforeEach(() => {
    storageMock = jasmine.createSpyObj('LocalStorage', ['get', 'set']);
    storageMock.get.and.returnValue(initialTripsStub);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalStorageService,
          useValue: {
            getStorageOf: () => storageMock,
          },
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
      const initialData = await localTripsService.localDataChanges$
        .pipe(take(1))
        .toPromise();
      expect(initialData).toEqual(initialTripsStub as any);
    })
  );

  it('should store trips to storage', () => {});
});

// we do not want to export internal types, so lets derive them from the exposed ones
type Trip = UnwrapArray<
  UnwrapObservable<LocalTripsService['localDataChanges$']>
>;
type LocalStorageOfTrips = LocalStorageType<Trip[]>;

//T extends Observable<infer U> ? U : never;
