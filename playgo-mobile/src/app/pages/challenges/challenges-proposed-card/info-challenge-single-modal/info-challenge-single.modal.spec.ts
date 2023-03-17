import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoChallengeSingleModalPage } from './info-challenge-single.modal';

describe('CampaignDetailsPage', () => {
  let component: InfoChallengeSingleModalPage;
  let fixture: ComponentFixture<InfoChallengeSingleModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InfoChallengeSingleModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoChallengeSingleModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
