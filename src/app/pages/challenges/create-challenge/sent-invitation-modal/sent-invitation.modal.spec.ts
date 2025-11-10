import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SentInvitationlModalPage } from './sent-invitation.modal';

describe('CampaignDetailsPage', () => {
  let component: SentInvitationlModalPage;
  let fixture: ComponentFixture<SentInvitationlModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SentInvitationlModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SentInvitationlModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
