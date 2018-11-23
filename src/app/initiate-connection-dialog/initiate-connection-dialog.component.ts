import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-initiate-connection-dialog',
  templateUrl: './initiate-connection-dialog.component.html',
  styleUrls: ['./initiate-connection-dialog.component.scss']
})
export class InitiateConnectionDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
