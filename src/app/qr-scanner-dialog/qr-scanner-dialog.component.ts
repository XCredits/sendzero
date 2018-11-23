import { Component, OnInit } from '@angular/core';
import { QrService } from '../qr.service';

@Component({
  selector: 'app-qr-scanner-dialog',
  templateUrl: './qr-scanner-dialog.component.html',
  styleUrls: ['./qr-scanner-dialog.component.scss']
})
export class QrScannerDialogComponent implements OnInit {

  constructor(private qrService: QrService) { }

  public switchCamera(): void {
    this.qrService.switchScannerCamera();
  }

  ngOnInit() {
  }

}
