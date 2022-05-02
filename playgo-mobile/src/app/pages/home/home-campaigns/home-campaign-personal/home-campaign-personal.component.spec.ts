import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeCampaignPersonalComponent } from './home-campaign-personal.component';

describe('MyCampaignsWidgetComponent', () => {
  let component: HomeCampaignPersonalComponent;
  let fixture: ComponentFixture<HomeCampaignPersonalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeCampaignPersonalComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(HomeCampaignPersonalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
