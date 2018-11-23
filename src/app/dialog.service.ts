import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subject } from 'rxjs';

import { ReceiveConnectionDialogComponent } from './receive-connection-dialog/receive-connection-dialog.component';
import { InitiateConnectionDialogComponent } from './initiate-connection-dialog/initiate-connection-dialog.component';
import { QrScannerDialogComponent } from './qr-scanner-dialog/qr-scanner-dialog.component';
import { ReceiveFileDialogComponent } from './receive-file-dialog/receive-file-dialog.component';


@Injectable({
  providedIn: 'root'
})
export class DialogService {
  receiveConnectionDialogRef: MatDialogRef<ReceiveConnectionDialogComponent>;
  initiateConnectionDialogRef: MatDialogRef<InitiateConnectionDialogComponent>;
  qrScannerDialogRef: MatDialogRef<QrScannerDialogComponent>;
  receiveFileDialogRef: MatDialogRef<ReceiveFileDialogComponent>;

  public receiveConnectionDialogResult$ = new Subject<any>();
  public initiateConnectionDialogResult$ = new Subject<any>();
  public qrScannerDialogResult$ = new Subject<any>();
  public receiveFileDialogResult$ = new Subject<any>();

  constructor(private dialog: MatDialog) { }

  openReceiveConnectionDialog(humanId: string): void {
    const dialogRef = this.dialog.open(ReceiveConnectionDialogComponent, {
      data: {humanId},
    });
    this.receiveConnectionDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(result => {
      this.receiveConnectionDialogResult$.next({result});
    });
  }

  closeReceiveConnectionDialog(result: boolean): void {
    this.receiveConnectionDialogRef.close(result);
  }

  openInitiateConnectionDialog(peerId: string): void {
    const dialogRef = this.dialog.open(InitiateConnectionDialogComponent, {
      data: {humanId: peerId},
    });
    this.initiateConnectionDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(result => {
      this.initiateConnectionDialogResult$.next({result});
    });
  }

  closeInitiateConnectionDialog(result: boolean): void {
    this.initiateConnectionDialogRef.close(result);
  }

  openQrScannerDialog(): void {
    const dialogRef = this.dialog.open(QrScannerDialogComponent);
    this.qrScannerDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  closeQrScannerDialog(result: boolean): void {
    this.qrScannerDialogRef.close(result);
  }

  openReceiveFileDialog(metadata: any): void {
    const dialogRef = this.dialog.open(ReceiveFileDialogComponent, {
      data: metadata,
    });
    this.receiveFileDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(result => {
      this.receiveFileDialogResult$.next({result});
    });
  }

  closeReceiveFileDialog(result: boolean): void {
    this.receiveFileDialogRef.close(result);
  }
}
