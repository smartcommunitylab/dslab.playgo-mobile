import { TestBed } from '@angular/core/testing';

import { BackgroundTrackingService } from './background-tracking.service';

describe('BackgroundTrackingService', () => {
  let service: BackgroundTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
