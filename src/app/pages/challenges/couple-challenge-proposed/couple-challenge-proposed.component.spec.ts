import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CoupleChallengeProposedComponent } from './couple-challenge-proposed.component';

describe('CoupleChallengeProposedComponent', () => {
  let component: CoupleChallengeProposedComponent;
  let fixture: ComponentFixture<CoupleChallengeProposedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CoupleChallengeProposedComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoupleChallengeProposedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
