import { TestBed } from '@angular/core/testing';

import { CarPoolingService } from './carpooling.service';

describe('CarPoolingService', () => {
  let service: CarPoolingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarPoolingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
