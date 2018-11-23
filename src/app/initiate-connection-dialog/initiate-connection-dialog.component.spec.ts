import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiateConnectionDialogComponent } from './initiate-connection-dialog.component';

describe('InitiateConnectionDialogComponent', () => {
  let component: InitiateConnectionDialogComponent;
  let fixture: ComponentFixture<InitiateConnectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitiateConnectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitiateConnectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
