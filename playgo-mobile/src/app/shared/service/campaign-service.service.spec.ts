import { TestBed } from '@angular/core/testing';

import { CampaignServiceService } from './campaign-service.service';

describe('MyCampaignServiceService', () => {
  let service: CampaignServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampaignServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
