import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChalengeSingleStatComponent } from './challenge-single-stat.component';

describe('ChalengeSingleStatComponent', () => {
  let component: ChalengeSingleStatComponent;
  let fixture: ComponentFixture<ChalengeSingleStatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChalengeSingleStatComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChalengeSingleStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
