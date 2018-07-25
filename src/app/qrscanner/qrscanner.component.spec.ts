import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QRScannerComponent } from './qrscanner.component';

describe('PrivacyComponent', () => {
  let component: QRScannerComponent;
  let fixture: ComponentFixture<QRScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QRScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QRScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
