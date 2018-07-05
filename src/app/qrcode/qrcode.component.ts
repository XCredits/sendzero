import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-profile',
    templateUrl: './qrcode.component.html',
    styleUrls: ['./qrcode.component.scss']
})

export class QRCodeComponent implements OnInit {
    public angularxQrCode: string = null;
    constructor () {
        // assign a value
        this.angularxQrCode = 'Your QR code data string';
    }

    ngOnInit() {

    }
}
