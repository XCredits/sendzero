import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveConnectionDialogComponent } from './receive-connection-dialog.component';

describe('ReceiveConnectionDialogComponent', () => {
  let component: ReceiveConnectionDialogComponent;
  let fixture: ComponentFixture<ReceiveConnectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveConnectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveConnectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
