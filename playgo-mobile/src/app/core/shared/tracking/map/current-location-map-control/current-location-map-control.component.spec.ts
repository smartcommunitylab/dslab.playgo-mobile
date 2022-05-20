import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CurrentLocationMapControlComponent } from './current-location-map-control.component';

describe('CurrentLocationMapControlComponent', () => {
  let component: CurrentLocationMapControlComponent;
  let fixture: ComponentFixture<CurrentLocationMapControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentLocationMapControlComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentLocationMapControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
