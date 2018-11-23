import { Component, OnInit } from '@angular/core';
import { QrService } from '../qr.service';

@Component({
  selector: 'app-qr-scanner-dialog',
  templateUrl: './qr-scanner-dialog.component.html',
  styleUrls: ['./qr-scanner-dialog.component.scss']
})
export class QrScannerDialogComponent implements OnInit {
  disableSwitchCamera = false;

  constructor(private qrService: QrService) {
    this.qrService.eventEmitter.subscribe(event => {
      switch (event) {
        case 'disable switch':
          this.disableSwitchCamera = true;
          break;
      }
    });
   }

  public switchCamera(): void {
    this.qrService.switchScannerCamera();
  }

  ngOnInit() {
  }

}
