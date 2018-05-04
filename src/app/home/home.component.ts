import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { SendZeroService } from '../send-zero.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Typed defintions
  title: string;
  id: string;
  peerId: string;
  fileForm: FormGroup;
  sub: Subscription;

  constructor(private ref: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              public sendZeroService: SendZeroService,
              private route: ActivatedRoute,
              private router: Router,) {
    this.title = 'SendZero Alpha';
    this.fileForm = new FormGroup({
      selectFile: new FormControl(),
    })
    var self = this;
  }

  sendFile(): void {
    let fileInput = this.fileForm.get('selectFile').value;
    if (!fileInput.files[0]) return;
    this.sendZeroService.sendFile(fileInput.files[0]);
  }

  ngOnInit(): void {
    this.sendZeroService.init();
    this.sub = this.route.queryParams.subscribe(params => {
        this.peerId = params['id'] || "";
        if (this.peerId.length > 0) {
          this.sendZeroService.setPeerId(this.peerId);
        }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  connectToPeer(): void {
    this.peerId = this.sendZeroService.peerId;
    this.sendZeroService.connectToPeer();
  }

}
