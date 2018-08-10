// https://github.com/Cordobo/angularx-qrcode
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { SendZeroService } from '../send-zero.service';

@Component({
    selector: 'app-qr',
    templateUrl: './qrcode.component.html',
    styleUrls: ['./qrcode.component.scss'],
})

export class QRCodeComponent implements OnInit, AfterViewInit {
    @Input() link: string = null;
    constructor (private sendZeroService: SendZeroService) {
        this.link = sendZeroService.connectionLink;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        const qrDiv = document.getElementById('qr');
        const qrDivChild = qrDiv.firstElementChild;
        const img = qrDivChild.lastElementChild;
        img.setAttribute('width', '100%');
    }
}
