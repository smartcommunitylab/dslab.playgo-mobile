import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChallengeBarStatusComponent } from './challenge-bar-status.component';

describe('ChallengeBarStatusComponent', () => {
  let component: ChallengeBarStatusComponent;
  let fixture: ComponentFixture<ChallengeBarStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallengeBarStatusComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeBarStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
