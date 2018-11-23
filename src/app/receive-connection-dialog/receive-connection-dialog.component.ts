import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-receive-connection-dialog',
  templateUrl: './receive-connection-dialog.component.html',
  styleUrls: ['./receive-connection-dialog.component.scss']
})
export class ReceiveConnectionDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
