import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SingleMeanStatisticComponent } from './single-mean-statistic.component';

describe('GeneralStatisticsComponent', () => {
  let component: SingleMeanStatisticComponent;
  let fixture: ComponentFixture<SingleMeanStatisticComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SingleMeanStatisticComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleMeanStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
