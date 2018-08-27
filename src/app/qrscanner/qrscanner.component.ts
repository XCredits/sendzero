// https://github.com/goergch/angular2-qrscanner
import { Component, ViewChild, ViewEncapsulation, OnChanges, OnInit, Input } from '@angular/core';
import { SendZeroService, QRScannerDialogComponent } from '../send-zero.service';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.component.html',
  styleUrls: ['./qrscanner.component.scss']
})

export class QRScannerComponent implements OnInit {
  @ViewChild('scanner') qrScanner: ZXingScannerComponent;

  constructor(private sendZeroService: SendZeroService,
              private qrScannerDialogComponent: QRScannerDialogComponent) {}

  ngOnInit() {
    const self = this;
    const enumerateDevicesPromise = new Promise((resolve, reject) => {
      this.qrScanner.enumarateVideoDevices((devices) => {
        resolve(devices);
      });
    });

    enumerateDevicesPromise
        .then((devices: any) => {
          self.qrScanner.startScan(devices[0]); // scan(devices[0].deviceId);
        });
  }
  scanSuccessHandler(event: any) {
    // console.log(event);
    const peerId = this.sendZeroService.removeURLFromPeer(event);
    this.sendZeroService.setConnectToPeerId(peerId);
    this.qrScannerDialogComponent.closeDialog(true);
    this.qrScanner.resetScan();
  }


  // TODO: Use event emitters
  scanErrorHandler(event: any) {
    // console.log(event);
  }

  scanFailureHandler(event: any) {
    // console.log(event);
  }

  scanCompleteHandler(event: Event) {
    // console.log(event);
  }
}
