import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-receive-file-dialog',
  templateUrl: './receive-file-dialog.component.html',
  styleUrls: ['./receive-file-dialog.component.scss']
})
export class ReceiveFileDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
