import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { SendZeroService } from '../send-zero.service';
import { FormGroup, FormControl } from '@angular/forms';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

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

  constructor(private ref: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              public sendZeroService: SendZeroService,
              private route: ActivatedRoute,
              private router: Router) {
    this.title = 'SendZero Alpha';
    this.fileForm = new FormGroup({
      selectFile: new FormControl(),
    });
    const self = this;
  }

  sendFile(): void {
    const fileInput = this.fileForm.get('selectFile').value;
    if (!fileInput || !fileInput.files[0]) {
     return;
    }
    this.sendZeroService.sendFile(fileInput.files[0]);
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  connectToPeer(): void {
    this.sendZeroService.connectToPeer();
  }

}
