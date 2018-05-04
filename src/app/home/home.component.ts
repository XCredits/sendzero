import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { SendZeroService } from '../send-zero.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Typed defintions
  title: string;
  prompt: string;
  id: string;
  peerId: string;
  file: File;
  fileProgress: number = 0;
  maxFileChunks: number = 0;
  sub: Subscription;

  constructor(private ref: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              public sendZeroService: SendZeroService,
              private route: ActivatedRoute,
              private router: Router,) {
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
    this.sub = this.route.queryParams.subscribe(params => {
        this.peerId = params['id'] || "";
        if (this.peerId.length > 0) {
          this.sendZeroService.setPeerId(this.peerId);
          this.sendZeroService.connectToPeer();
        }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  connectToPeer(): void {
    this.sendZeroService.connectToPeer();
  }

}
