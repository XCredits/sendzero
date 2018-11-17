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
              private qrScannerDialog: QRScannerDialogComponent) {}

  // TODO: Being reused in Dialog Compnent as well, think about making into
  // a service
  ngOnInit() {
    const self = this;
    const enumerateDevicesPromise = new Promise((resolve, reject) => {
      self.qrScanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
        resolve(devices);
      });
      //
      // this.qrScanner.enumarateVideoDevices((devices) => {
      //   resolve(devices);
      // });
    });

    enumerateDevicesPromise
        .then((devices: any) => {
          let device;
          devices.forEach(dev => {
            if (dev.label.includes('back') ||
                dev.label.includes('Back') ||
                dev.label.includes('rear') ||
                dev.label.includes('Rear')) {
              device = dev;
            }
          });
          if (!device) {
            device = devices[0];
          }
          self.qrScanner.startScan(device);
        });
  }

  // switchCamera(): void {
  //   const self = this;

  //   const currentDevice = self.qrScanner.device;
  //   const enumerateDevicesPromise = new Promise((resolve, reject) => {
  //     self.qrScanner.enumarateVideoDevices((devices) => {
  //       resolve(devices);
  //     });
  //   });
  //   let allDevices: Array<any>;
  //   enumerateDevicesPromise.then((devices: Array<any>) => allDevices = devices);
  //   const currentDeviceIndex
  //       = allDevices.findIndex(dev => dev.deviceId === currentDevice.deviceId);

  //   const newDevice
  //     = allDevices[currentDeviceIndex + 1]
  //       ? allDevices[currentDeviceIndex + 1]
  //       : allDevices[0];
  //   this.qrScanner.changeDevice(newDevice);
  // }

  scanSuccessHandler(event: any) {
    // console.log(event);
    const peerId = this.sendZeroService.removeURLFromPeer(event);
    this.sendZeroService.setConnectToPeerId(peerId);
    // Try not to use this
    // this.sendZeroService.dialog.closeAll();
    this.qrScannerDialog.closeDialog(true);

    // TODO Try to bring this back in
    // this.qrScanner.resetScan();
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
