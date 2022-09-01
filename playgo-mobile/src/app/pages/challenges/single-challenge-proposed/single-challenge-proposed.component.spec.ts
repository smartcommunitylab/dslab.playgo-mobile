import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SingleChallengeProposedComponent } from './single-challenge-proposed.component';

describe('CreateChallengeButtonComponent', () => {
  let component: SingleChallengeProposedComponent;
  let fixture: ComponentFixture<SingleChallengeProposedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SingleChallengeProposedComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleChallengeProposedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
