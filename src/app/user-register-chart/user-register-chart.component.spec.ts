import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegisterChartComponent } from './user-register-chart.component';

describe('UserRegisterChartComponent', () => {
  let component: UserRegisterChartComponent;
  let fixture: ComponentFixture<UserRegisterChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRegisterChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegisterChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
