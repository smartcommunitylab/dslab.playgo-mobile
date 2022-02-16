import { TestBed } from '@angular/core/testing';

import { TrackingMainService } from './tracking-main.service';

describe('TrackingMainService', () => {
  let service: TrackingMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackingMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
