import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FirstTimeBackgrounModalPage } from './first-time.modal';

describe('CampaignDetailsPage', () => {
  let component: FirstTimeBackgrounModalPage;
  let fixture: ComponentFixture<FirstTimeBackgrounModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FirstTimeBackgrounModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FirstTimeBackgrounModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
