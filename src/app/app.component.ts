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
  title: string;
  file: File;
  
  constructor(private ref: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.title = 'SendZero Alpha';
    var self = this;
  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);
  }

  sendFile() {
  }

  ngOnInit() {
  }


  connectPeers() {
  }
}