import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailingListChartComponent } from './mailing-list-chart.component';

describe('MailingListChartComponent', () => {
  let component: MailingListChartComponent;
  let fixture: ComponentFixture<MailingListChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailingListChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailingListChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
