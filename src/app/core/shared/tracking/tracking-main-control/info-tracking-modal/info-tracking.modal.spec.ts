import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { InfoTrackingModalPage } from './info-tracking.modal';

describe('CampaignDetailsPage', () => {
  let component: InfoTrackingModalPage;
  let fixture: ComponentFixture<InfoTrackingModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InfoTrackingModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTrackingModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
