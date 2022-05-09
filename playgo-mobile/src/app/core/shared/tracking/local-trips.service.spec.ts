import { TestBed } from '@angular/core/testing';

import { LocalTripsService } from './local-trips.service';

describe('LocalTripsService', () => {
  let service: LocalTripsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalTripsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
