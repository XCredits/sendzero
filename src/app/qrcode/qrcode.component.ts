import { Component, OnInit, Input } from '@angular/core';
import { SendZeroService } from '../send-zero.service';

@Component({
    selector: 'app-qr',
    templateUrl: './qrcode.component.html',
    styleUrls: ['./qrcode.component.scss']
})

export class QRCodeComponent implements OnInit {
    @Input() link: string = null;
    constructor (private sendZeroService: SendZeroService) {
        // assign a value
        // this.link = 'Your QR code data string';
        this.link = sendZeroService.connectionLink;
    }

    ngOnInit() {

    }
}
