import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MainCampaignStatComponent } from './main-campaign-stat.component';

describe('CampaignCardComponent', () => {
  let component: MainCampaignStatComponent;
  let fixture: ComponentFixture<MainCampaignStatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MainCampaignStatComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(MainCampaignStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
