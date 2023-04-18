import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoChallengeGroupModalPage } from './info-challenge-group.modal';

describe('CampaignDetailsPage', () => {
  let component: InfoChallengeGroupModalPage;
  let fixture: ComponentFixture<InfoChallengeGroupModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InfoChallengeGroupModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoChallengeGroupModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
