import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { SendZeroService } from '../send-zero.service';
import { UserService } from '../user.service';
import { FormGroup, FormControl } from '@angular/forms';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { MatTable } from '@angular/material';
import { isEmpty } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';

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
  @ViewChild('fileInput') fileInput;
  @ViewChild(MatTable) table: MatTable<any>;
  columnsToDisplay: string[] = ['select', 'humanId', 'status', 'files'];
  selection: SelectionModel<any>;
  sendError = '';
  fileError = '';
  user: User;
  isLoggedIn: boolean;

  // Untyped defs
  file;
  peers;
  // To use Object.keys() in the template
  JSObject: any = Object;

  constructor(private ref: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              public sendZeroService: SendZeroService,
              private userService: UserService,
              private route: ActivatedRoute,
              private router: Router) {
    this.title = 'SendZero';
    // this.fileForm = new FormGroup({
    //   selectFile: new FormControl(),
    // });
    const self = this;
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection =
      new SelectionModel<any>(allowMultiSelect, initialSelection);
  }

  sendFile(): void {
    // const fileInput = this.fileForm.get('selectFile').value;
    if (!this.file) {
      this.sendZeroService.openSnackBar('Please select a file first!');
      return;
    }
    if (!this.selection.selected[0]) {
      this.sendZeroService.openSnackBar('Please select a peer first!');
      return;
    }
    this.sendZeroService.sendFile(this.file, this.selection.selected[0]);
  }

  ngOnInit(): void {
    this.sub = this.route.queryParams.subscribe(params => {
        const peerId = params['id'] || '';
        if (peerId.length > 0) {
          this.sendZeroService.setConnectToPeerId(peerId);
        }
    });
    this.sendZeroService.peerSubject.subscribe((data) => {
        this.peers = data;
        if (this.table) {
          this.table.renderRows();
        }
    });
    this.userService.userObservable
        .subscribe(user => {
          this.user = user;
          this.isLoggedIn = !!this.user;
        });
  }

  // TODO: Set prompts
  fileDropped(event: UploadEvent): void {
    if (event.files.length > 1) {
      this.fileError = 'Please choose one file at a time!';
      return;
    }
    if (!event.files[0].fileEntry.isFile) {
      this.fileError = 'Please choose a file! We do not support directories.';
      return;
    }
    this.fileError = '';
    const fileEntry = event.files[0].fileEntry as FileSystemFileEntry;
    fileEntry.file((file: File) => {
      this.file = file;
    });
  }

  fileChanged(event): void {
    this.fileError = '';
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

  openQRScanner(): void {
    this.sendZeroService.openQRScanner();
  }

}

interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}
