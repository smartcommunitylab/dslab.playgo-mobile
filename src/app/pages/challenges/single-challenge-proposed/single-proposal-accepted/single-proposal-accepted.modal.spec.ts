import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SingleProposalAcceptedModalPage } from './single-proposal-accepted.modal';

describe('CampaignDetailsPage', () => {
  let component: SingleProposalAcceptedModalPage;
  let fixture: ComponentFixture<SingleProposalAcceptedModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SingleProposalAcceptedModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleProposalAcceptedModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
