import { TestBed } from '@angular/core/testing';

import { TripPersistanceService } from './trip-persistance.service';

describe('TripPersistanceService', () => {
  let service: TripPersistanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripPersistanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
