import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DetailNotificationLevelComponent } from './detail-notification-level.component';

describe('DetailNotificationLevelComponent', () => {
  let component: DetailNotificationLevelComponent;
  let fixture: ComponentFixture<DetailNotificationLevelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailNotificationLevelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailNotificationLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
