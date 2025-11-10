import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CompaniesCampaignPage } from './companies.page';

describe('CampaignDetailsPage', () => {
  let component: CompaniesCampaignPage;
  let fixture: ComponentFixture<CompaniesCampaignPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompaniesCampaignPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CompaniesCampaignPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
