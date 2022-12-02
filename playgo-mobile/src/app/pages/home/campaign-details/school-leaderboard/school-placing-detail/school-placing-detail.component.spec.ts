import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SchoolPlacingDetailComponent } from './school-placing-detail.component';

describe('SchoolPlacingDetailComponent', () => {
  let component: SchoolPlacingDetailComponent;
  let fixture: ComponentFixture<SchoolPlacingDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SchoolPlacingDetailComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolPlacingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
