import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeCampaignSchoolComponent } from './home-campaign-school.component';

describe('MyCampaignsWidgetComponent', () => {
  let component: HomeCampaignSchoolComponent;
  let fixture: ComponentFixture<HomeCampaignSchoolComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeCampaignSchoolComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCampaignSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
