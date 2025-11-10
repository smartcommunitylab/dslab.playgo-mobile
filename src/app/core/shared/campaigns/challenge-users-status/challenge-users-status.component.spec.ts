import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChallengeUsersStatusComponent } from './challenge-users-status.component';

describe('ChallengeUserStatusComponent', () => {
  let component: ChallengeUsersStatusComponent;
  let fixture: ComponentFixture<ChallengeUsersStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChallengeUsersStatusComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeUsersStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
