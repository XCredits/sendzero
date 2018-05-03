declare var require: any
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SendZeroService } from './send-zero.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Typed defintions
  title: string;
  prompt: string;
  id: string;
  peerId: string;
  file: File;
  fileProgress: number = 0;
  maxFileChunks: number = 0;
  
  constructor(private ref: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              public sendZeroService: SendZeroService) {
    this.title = 'SendZero Alpha';
    var self = this;
  }

  handleFileInput(files: FileList): void {
    this.file = files.item(0);
  }

  sendFile(): void {
    if (!this.file) return;
    this.sendZeroService.sendFile(this.file);
  }

  ngOnInit(): void {
    this.sendZeroService.init();
  }

  connectToPeer(): void {
    this.sendZeroService.connectToPeer();
  }
}