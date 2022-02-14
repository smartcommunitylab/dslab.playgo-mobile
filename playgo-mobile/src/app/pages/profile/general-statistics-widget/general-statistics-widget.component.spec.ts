import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GeneralStatisticsWidgetComponent } from './general-statistics-widget.component';

describe('GeneralStatisticsWidgetComponent', () => {
  let component: GeneralStatisticsWidgetComponent;
  let fixture: ComponentFixture<GeneralStatisticsWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralStatisticsWidgetComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralStatisticsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
