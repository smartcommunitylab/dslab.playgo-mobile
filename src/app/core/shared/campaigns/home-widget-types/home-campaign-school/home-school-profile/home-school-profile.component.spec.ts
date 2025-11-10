import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeSchoolProfiloComponent } from './home-school-profile.component';

describe('MyCampaignsWidgetComponent', () => {
  let component: HomeSchoolProfiloComponent;
  let fixture: ComponentFixture<HomeSchoolProfiloComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeSchoolProfiloComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeSchoolProfiloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
