import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeSchoolProgressionComponent } from './home-school-progression.component';

describe('MyCampaignsWidgetComponent', () => {
  let component: HomeSchoolProgressionComponent;
  let fixture: ComponentFixture<HomeSchoolProgressionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeSchoolProgressionComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeSchoolProgressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
