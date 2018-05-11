declare var require: any;
import { Injectable, Component, Inject } from '@angular/core';
import { OnInit, ApplicationRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';



const io = require('socket.io-client');
const Peer = require('simple-peer');
const SimpleSignalClient = require('simple-signal-client');
// Simple peer splits files greater than ~64k, so we make our lives easier
// by splitting up files ino 60k chunks
const CHUNK_SIZE = 60000;
let SERVER_URL;
if (String(window.location.hostname) === 'localhost') {
  SERVER_URL = 'http://localhost:3000';
}



@Injectable()
export class SendZeroService {
  // Typed definitions
  public id: string;
  public peerId: string;
  public prompt: string;
  public connectionPrompt: string;
  public url: SafeResourceUrl;
  private unsafeUrl: string;
  public disableConnectButton: boolean;
  public disableSendButton: boolean;
  public fileReadyForDownload: boolean;
  public fileName: string;
  // For progress element
  public maxFileChunks = 0;
  public receivedChunks = 0;
  private receivedFileMetadata: {
    fileName: string,
    fileType: string,
    fileSize: number,
    fileByteSize: number,
    numberOfChunks: number,
  };
  private fileArray: Uint8Array;
  private fileArrayOffset = 0;
  private fileReader: FileReader;
  private file: File;
  // For file sending
  private fileChunks: Array<Uint8Array>;

  // Untyped definitions
  private socket: any;
  private signalClient: any;
  private peer: any;

  constructor(private ref: ApplicationRef,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog) {
    this.id = '';
    this.peerId = '';
    this.prompt = 'Please wait...';
    this.disableConnectButton = true;
    this.disableSendButton = true;
    this.fileReadyForDownload = false;
   }

  public init(): void {
    const self = this;

    // Set up socket
    this.socket = io(SERVER_URL, {transports: ['websocket']});
    this.socket.on('request declined', (request) => {
      if (request.id === this.id) {
        this.prompt = 'The user declined your request!';
      }
    });

    // Set up signal client
    this.signalClient = new SimpleSignalClient(this.socket);

    // Set up signal client's handler functions
    this.signalClient.on('ready', this.handleSignalClientReadyState.bind(this));
    this.signalClient.on('request', this.handleSignalClientRequest.bind(this));
    this.signalClient.on('peer', this.handleSignalClientPeer.bind(this));

    // Set up file reader
    this.fileReader = new FileReader();
    // Function that determines what to do after reading the file.
    this.fileReader.onload = this.finishReadingFile.bind(this);
  }

  private handleSignalClientReadyState(): void {
    this.prompt = 'Ready to connect!';
    this.id = this.signalClient.id;
    this.connectionPrompt = 'Users can connect to you by following this link: ' + window.location.origin + '/home?id=' + this.id;
    this.ref.tick();
    this.disableConnectButton = false;
  }

  // Maybe add more logic here - esp for some domains/IPs
  private handleSignalClientRequest(request: any): void {
    // This function will handle the acceptance of the offer
    this.openConnectionDialog(request);
  }

  private handleSignalClientPeer(peer: any): void {
    this.peer = peer;
    // Set up peer handling functions
    this.peer.on('connect', this.handlePeerConnect.bind(this));
    this.peer.on('data', this.handlePeerReceiveData.bind(this));
    this.peer.on('error', this.handlePeerError.bind(this));
  }

  private handlePeerConnect(): void {
    this.prompt = 'Now connected to peer! Select a file to send!';
    this.peerId = this.peer.id;
    this.disableSendButton = false;
    this.ref.tick();
  }

  // Data always comes in as Uint8Array of size CHUNK_SIZE
  private handlePeerReceiveData(data: Uint8Array): void {
    // We first try to convert data to String/JSON as metadata of the file
    // always received as JSON and messages as strings.
    // If this doesn't work, then we assume that we've received a file.
    try {
      // @ts-ignore
      const messageOrMetadataString = new TextDecoder('utf-8').decode(data);
      // Various cases
      // 1. We receive a message saying we can continue sending file (after
      // we've sent file metadata through)
      // 2. We receive a message saying we cannot send the file (after we've
      // sent file metadata through)
      // 3. We're receiving an actual metadata object and we have to ask the
      // user if they want to accept the file by opening the dialog
      if (messageOrMetadataString === 'File Accepted') {
        // We can now continue sending our file.
        this.sendChunkedFile();
      } else if (messageOrMetadataString === 'File Declined') {
        // We should now clear all file related variables in our state.
        this.prompt = 'Peer did not accept the file! Please try again.';
        this.ref.tick();
        this.fileChunks = null;
      } else {
        const fileMetadata = JSON.parse(messageOrMetadataString);
        if (this.fileReadyForDownload) {
          this.resetReceiveVariables();
          window.URL.revokeObjectURL(this.unsafeUrl);
        }
        // this.fileReadyForDownload = false;
        // Reassign (deep copy) rather than fileMetadata = receivedFileMetaData
        this.receivedFileMetadata = JSON.parse(messageOrMetadataString);
        this.fileName = this.receivedFileMetadata.fileName;
        // Initialize a Uint8Array
        this.fileArray = new Uint8Array(this.receivedFileMetadata.fileByteSize);
        this.ref.tick();
        this.openReceiveFileDialog(fileMetadata);
      }
    } catch (e) {
      // We've (hopefully) received part of a file (a chunk).
      // If it's the first data array, set the fileArray with it
      // We maintain an offset so that we can set the arrays correctly
      // Then set the rest of the data arrays into our file array
      // If it's the last data array, we get the blob.

      if (this.receivedChunks === 0) {
        this.fileArray.set(data);
        this.fileArrayOffset = CHUNK_SIZE;
        this.receivedChunks++;
        this.ref.tick();
      } else if (this.receivedChunks < this.maxFileChunks - 1) {
        this.fileArray.set(data, this.fileArrayOffset);
        this.fileArrayOffset += CHUNK_SIZE;
        this.receivedChunks++;
        // This is because Angular doesn't detect changes in callbacks.
        this.ref.tick();
      } else {
        this.fileArray.set(data, this.fileArrayOffset);
        this.receivedChunks++;
        this.ref.tick();
        this.makeBlob();
      }
    }
  }

  private makeBlob(): void {
    // let u8Array = Uint8Array.from(this.fileArray);
    const blob = new Blob([this.fileArray],
        {type: this.receivedFileMetadata.fileType});
    const url = window.URL.createObjectURL(blob);
    this.unsafeUrl = url;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // Set up download prompt
    this.url = safeUrl;
    this.fileReadyForDownload = true;
    this.prompt = 'File is ready for download!';
    this.ref.tick();
    // Resetting the variables is now done when another file is received
    // This is to prevent file info from getting erased immadietaly after it
    // arrives.
    // this.resetReceiveVariables();
    this.ref.tick();
  }

  private resetReceiveVariables(): void {
    this.fileArray = null;
    this.fileArrayOffset = 0;
    this.fileName = null;
    this.receivedChunks = 0;
    this.maxFileChunks = 0;
    this.receivedFileMetadata = null;
  }

  // TODO: Error handling.
  private handlePeerError(err: any): void {
    this.prompt = 'Something went wrong! Please try connecting again.';
    console.log(err);
  }

  // TODO: Check if return behaviour is correct
  private finishReadingFile(): void {
    this.prompt = 'Finished processing file. Waiting for confirmation from peer!';
    this.ref.tick();
    // Make sure the file has actually been read
    if (this.fileReader.readyState !== 2) {
      this.prompt = 'Something went wrong! Please try again.';
      return;
    }
    this.chunkFileAndSendMetadata();
  }

  private chunkFileAndSendMetadata(): void {
    // Clear fileChunk arrray since it's a new file
    // Make the file into a typed array to send it as the WebRTC API doesn't
    // support sending blobs at this point.
    const fileView = new Uint8Array(this.fileReader.result);
    const fileByteLength = fileView.byteLength;
    // Set number of chunks. We split each file into 60k chunks as simple-peer
    // only supports sending ~64k(?) chunks at one time and does its own
    // splitting otherwise, which throttles the connection.
    const numberOfChunks = Math.ceil(fileByteLength / CHUNK_SIZE);
    // Pre allocate arrays as assigning chunks is faster than
    // pushing chunks into an array
    this.fileChunks = Array(numberOfChunks);
    const chunks = Array(numberOfChunks);
    // Assign chunks
    for (let i = 0; i < numberOfChunks - 1; i++) {
      const chunk = fileView.slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
      chunks[i] = chunk;
    }
    // Assign final chunk
    chunks[numberOfChunks - 1] =
        (fileView.slice(CHUNK_SIZE * (numberOfChunks - 1)));

    // Set up and send metadata for the file
    const metadata = {
      fileName: this.file.name,
      fileType: this.file.type,
      fileSize: this.file.size,
      fileByteSize: fileByteLength,
      numberOfChunks: numberOfChunks,
    };
    const jsonString = JSON.stringify(metadata);
    // Dirty check to make sure metadata isn't too big.
    // TODO: Make sure things can't be circular because JSON.Parse/stringify
    // will break
    if (jsonString.length > CHUNK_SIZE) {
      this.prompt = 'File metadata too big, consider renaming.';
      this.ref.tick();
      return;
    }
    this.peer.send(jsonString);

    // Save chunked file
    this.fileChunks = chunks;
  }

  private sendChunkedFile(): void {
    this.prompt = 'Received confirmation, now sending file!';
    this.ref.tick();
    // Send chunks
    // We use write instead of send as send closes the connection on big files.
    let chunk;
    while ((chunk = this.fileChunks.shift()) !== undefined) {
      this.peer.write(chunk);
    }
    // console.log(this.fileChunks);
    // this.fileChunks.forEach(element => {
    //   console.log(element);
    //   this.peer.write(element);
    // });

    this.prompt = 'Finished sending file!';
    this.ref.tick();
  }

  public connectToPeer(): void {
    this.prompt = 'Connecting...';
    this.signalClient.connect(this.peerId.trim());
  }

  public getId(): string {
    console.log(this.id);
    return this.id;
  }

  // In case we get id from URL
  public setPeerId(id: string): void {
    this.peerId = id;
    this.ref.tick();
  }

  public getPeerId(): string {
    return this.peerId.trim();
  }

  public sendFile(file: File): void {
    this.prompt = 'Now processing file!';
    this.file = file;
    this.fileReader.readAsArrayBuffer(file);
  }

  private openConnectionDialog(request: any): void {
    const dialogRef = this.dialog.open(ConnectionDialogComponent, {
      data: {id: request.id},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        request.accept();
      } else {
        this.socket.emit('request declined', request);
      }
    });
  }

  private openReceiveFileDialog(metadata: any): void {
    metadata.id = this.peerId;
    this.ref.tick();
    const dialogRef = this.dialog.open(ReceiveFileDialogComponent, {
      data: metadata,
    });
    this.ref.tick();
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.peer.send('File Accepted');
        this.fileReadyForDownload = false;
        // Set up maxFileChunks for expected file - we do this for the progress
        // element
        this.maxFileChunks = metadata.numberOfChunks;
      } else {
        this.peer.send('File Declined');
        // Clear state variables
        this.resetReceiveVariables();
      }
    });
  }
}

// Connection dialog component
// TODO: move to home component
@Component({
  selector: 'app-connection-dialog',
  template: `
    <h1 mat-dialog-title> User with id {{data.id}} wants to connect to your browser. Accept?</h1>
    <mat-dialog-actions>
    <button mat-raised-button [mat-dialog-close]='true' cdkFocusInitial color='primary'>Yes</button>
    <button mat-raised-button [mat-dialog-close]='false' color='warn'>No</button>
    </mat-dialog-actions>`,
})
export class ConnectionDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}

@Component({
  selector: 'app-receive-file-dialog',
  template: `
    <h1 mat-dialog-title> User with id {{data.id}} wants to send you a file. Accept?</h1>
    <mat-dialog-content>
      File Name: {{data.fileName}}
      <br>
      File Type: {{data.fileType}}
      <br>
      File Size: {{data.fileSize | byteFormat}}
    </mat-dialog-content>
    <mat-dialog-actions>
    <button mat-raised-button (click)='closeDialog(true)' cdkFocusInitial color='primary'>Yes</button>
    <button mat-raised-button (click)='closeDialog(false)' color='warn'>No</button>
    </mat-dialog-actions>`,
})
export class ReceiveFileDialogComponent {
  constructor(private dialogRef: MatDialogRef<ReceiveFileDialogComponent>,
              private ref: ApplicationRef,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  public closeDialog(result: boolean): void {
    this.dialogRef.close(result);
    this.ref.tick();
  }
}

