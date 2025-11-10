import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SchoolLeaderboardPage } from './school-leaderboard.page';

describe('SchoolLeaderboardPage', () => {
  let component: SchoolLeaderboardPage;
  let fixture: ComponentFixture<SchoolLeaderboardPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolLeaderboardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolLeaderboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
