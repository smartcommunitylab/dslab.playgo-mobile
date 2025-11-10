import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeCampaignChallengeComponent } from './app-home-campaign-challenges.component';

describe('MyCampaignsWidgetComponent', () => {
  let component: HomeCampaignChallengeComponent;
  let fixture: ComponentFixture<HomeCampaignChallengeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeCampaignChallengeComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCampaignChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
