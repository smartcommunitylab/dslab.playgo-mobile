import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CarpoolingScanQRDialogComponent } from './carpooling-scan-qr-dialog.component';

describe('CarpoolingScanQRDialogComponent', () => {
  let component: CarpoolingScanQRDialogComponent;
  let fixture: ComponentFixture<CarpoolingScanQRDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CarpoolingScanQRDialogComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CarpoolingScanQRDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
