import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  @Output() eventEmitter: EventEmitter<string> = new EventEmitter();

  constructor() { }

  switchScannerCamera(): void {
    this.eventEmitter.emit('switch camera');
  }

  disableSwitchCamera(): void {
    this.eventEmitter.emit('disable switch');
  }
}
