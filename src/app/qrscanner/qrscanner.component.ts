import { Component, ViewChild, ViewEncapsulation, OnChanges, OnInit, Input } from '@angular/core';
import { SendZeroService } from '../send-zero.service';
import {QrScannerComponent} from 'angular2-qrscanner';

@Component({
    selector: 'app-qrscan',
    templateUrl: './qrscanner.component.html',
    styleUrls: ['./qrscanner.component.scss']
})

export class QRScannerComponent implements OnInit {
    @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent ;
    // @Input() link: string = null;
    constructor (private sendZeroService: SendZeroService) {
        // assign a value
        // this.link = 'Your QR code data string';
        // this.link = sendZeroService.connectionLink;
    }

    ngOnInit() {
        this.qrScannerComponent.getMediaDevices().then(devices => {
        console.log(devices);
        const videoDevices: MediaDeviceInfo[] = [];
        for (const device of devices) {
            if (device.kind.toString() === 'videoinput') {
                videoDevices.push(device);
            }
        }
        if (videoDevices.length > 0) {
            let choosenDev;
            for (const dev of videoDevices) {
                if (dev.label.includes('front')) {
                    choosenDev = dev;
                    break;
                }
            }
            if (choosenDev) {
                this.qrScannerComponent.chooseCamera.next(choosenDev);
            } else {
                this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
            }
        }
        });

        this.qrScannerComponent.capturedQr.subscribe(result => {
            console.log(result);
        });
    }
}
