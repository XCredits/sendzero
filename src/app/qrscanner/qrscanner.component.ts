// https://github.com/goergch/angular2-qrscanner
import { Component, ViewChild, ViewEncapsulation, OnChanges, OnInit, Input } from '@angular/core';
import { SendZeroService } from '../send-zero.service';
import { DialogService } from '../dialog.service';
import { QrService } from '../qr.service';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.component.html',
  styleUrls: ['./qrscanner.component.scss']
})

export class QRScannerComponent implements OnInit {
  @ViewChild('scanner') qrScanner: ZXingScannerComponent;
  devices: MediaDeviceInfo[];
  deviceBeingUsed: MediaDeviceInfo;

  constructor(private sendZeroService: SendZeroService,
              private qrService: QrService,
              private dialogService: DialogService) {
    this.qrService.eventEmitter.subscribe(event => {
      switch (event) {
        case 'switch camera':
          this.switchCamera();
          break;
      }
    });
  }

  ngOnInit() {
    const self = this;
    const enumerateDevicesPromise = new Promise((resolve, reject) => {
      self.qrScanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
        resolve(devices);
      });
    });

    enumerateDevicesPromise
        .then((devices: Array<any>) => {
          self.devices = devices;
          console.log(devices);
          if (devices.length === 1) {
            self.qrService.disableSwitchCamera();
          }
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
          self.deviceBeingUsed = device;
          self.qrScanner.startScan(device);
        });
  }

  switchCamera(): void {
    const self = this;
    const allDevices = self.devices;
    const currentDevice = self.deviceBeingUsed;
    const currentDeviceIndex
        = allDevices.findIndex(dev => dev.deviceId === currentDevice.deviceId);
    const newDevice
      = allDevices[currentDeviceIndex + 1]
        ? allDevices[currentDeviceIndex + 1]
        : allDevices[0];
    self.deviceBeingUsed = newDevice;
    this.qrScanner.changeDevice(newDevice);
  }

  scanSuccessHandler(event: any) {
    // console.log(event);
    const peerId = this.sendZeroService.removeURLFromPeer(event);
    this.sendZeroService.setConnectToPeerId(peerId);
    this.dialogService.closeQrScannerDialog(true);
    this.qrScanner.resetCodeReader();
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
