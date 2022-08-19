import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DetailNotificationBadgeComponent } from './detail-notification-badge.component';

describe('DetailNotificationBadgeComponent', () => {
  let component: DetailNotificationBadgeComponent;
  let fixture: ComponentFixture<DetailNotificationBadgeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailNotificationBadgeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailNotificationBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
