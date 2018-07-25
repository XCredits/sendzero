// https://github.com/Cordobo/angularx-qrcode
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
        this.link = sendZeroService.connectionLink;
    }

    ngOnInit() {

    }
}
