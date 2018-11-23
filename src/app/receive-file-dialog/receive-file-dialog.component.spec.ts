import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveFileDialogComponent } from './receive-file-dialog.component';

describe('ReceiveFileDialogComponent', () => {
  let component: ReceiveFileDialogComponent;
  let fixture: ComponentFixture<ReceiveFileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveFileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
