import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { SendZeroService } from '../send-zero.service';
import { FormGroup, FormControl } from '@angular/forms';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  // Typed defintions
  title: string;
  id: string;
  peerToConnectTo: string;
  fileForm: FormGroup;
  sub: Subscription;
  // To use Object.keys() in the template
  JSObject: Object = Object;
  @ViewChild('fileInput') fileInput;

  // Untyped defs
  file;

  constructor(private ref: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              public sendZeroService: SendZeroService,
              private route: ActivatedRoute,
              private router: Router) {
    this.title = 'SendZero Alpha';
    // this.fileForm = new FormGroup({
    //   selectFile: new FormControl(),
    // });
    const self = this;
  }

  sendFile(): void {
    // const fileInput = this.fileForm.get('selectFile').value;
    if (!this.file) {
     return;
    }
    this.sendZeroService.sendFile(this.file);
  }

  ngOnInit(): void {
    this.sendZeroService.init();
    this.sub = this.route.queryParams.subscribe(params => {
        const peerId = params['id'] || '';
        if (peerId.length > 0) {
          this.sendZeroService.setConnectToPeerId(peerId);
        }
    });
  }

  // TODO: Set prompts
  fileDropped(event: UploadEvent): void {
    if (event.files.length > 1) {
      console.log('Please choose one file at a time!');
    }
    if (!event.files[0].fileEntry.isFile) {
      console.log('Please choose a file!');
    }
    const fileEntry = event.files[0].fileEntry as FileSystemFileEntry;
    fileEntry.file((file: File) => {
      this.file = file;
    });
  }

  fileChanged(event): void {
    this.file = event.target.files[0];
  }

  openFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  connectToPeer(): void {
    this.sendZeroService.connectToPeer();
  }

}
