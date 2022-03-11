import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CarpoolingShowQRDialogComponent } from './carpooling-show-qr-dialog.component';

describe('CarpoolingShowQRDialogComponent', () => {
  let component: CarpoolingShowQRDialogComponent;
  let fixture: ComponentFixture<CarpoolingShowQRDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CarpoolingShowQRDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CarpoolingShowQRDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
