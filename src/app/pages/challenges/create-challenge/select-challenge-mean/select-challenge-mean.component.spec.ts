import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectChallengeMeanComponent } from './select-challenge-mean.component';

describe('SelectChallengeMeanComponent', () => {
  let component: SelectChallengeMeanComponent;
  let fixture: ComponentFixture<SelectChallengeMeanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectChallengeMeanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectChallengeMeanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
