declare var require: any
import { Injectable, Component, Inject } from '@angular/core';
import { OnInit, ApplicationRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';



let io = require('socket.io-client');
let Peer = require('simple-peer');
let SimpleSignalClient = require('simple-signal-client');
// Simple peer splits files greater than ~64k, so we make our lives easier
// by splitting up files ino 60k chunks
let CHUNK_SIZE = 60000
let SERVER_URL;
if (String(window.location.hostname) === "localhost") {
  SERVER_URL = "http://localhost:3000";
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
  public maxFileChunks: number = 0;
  public receivedChunks: number = 0;
  private receivedFileMetadata: {
    fileName: string,
    fileType: string,
    fileSize: number,
    fileByteSize: number,
    numberOfChunks: number,
  };
  private fileArray: Uint8Array;
  private fileArrayOffset: number = 0;
  private fileReader: FileReader;
  private file: File;
  
  // Untyped definitions
  private socket: any;
  private signalClient: any;
  private peer: any;

  constructor(private ref: ApplicationRef,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog) {
    this.id = "";
    this.peerId = "";
    this.prompt = "Please wait..."; 
    this.disableConnectButton = true; 
    this.disableSendButton = true; 
    this.fileReadyForDownload = false;
   }

  public init(): void {
    var self = this;
    
    // Set up socket
    this.socket = io(SERVER_URL, {transports: ['websocket']});
    this.socket.on('request declined', (request) => {
      if (request.id === this.id) {
        this.prompt = 'The user declined your request!';
      }
    })

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
    this.prompt = "Ready to connect!";
    this.id = this.signalClient.id;
    this.connectionPrompt = "Users can connect to you by following this link: " + window.location.origin + '/home?id=' + this.id;
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
    this.ref.tick();
    this.disableSendButton = false;
  }

  // Data always comes in as Uint8Array of size CHUNK_SIZE
  private handlePeerReceiveData(data: Uint8Array): void {
    // We first try to convert data to JSON as metadata of the file is always
    // received as JSON.
    // If this doesn't work, then we assume that we've received a file.
    try {
      this.prompt = "Now receiving a file!"
      if (this.fileReadyForDownload) {
        window.URL.revokeObjectURL(this.unsafeUrl);
      }
      this.fileReadyForDownload = false;
      this.ref.tick(); 
      // @ts-ignore
      let metadataString = new TextDecoder('utf-8').decode(data);
      this.receivedFileMetadata = JSON.parse(metadataString);
      this.fileName = this.receivedFileMetadata.fileName;
      // Set up maxFileChunks for expected file - we do this for the progress
      // element
      this.maxFileChunks = this.receivedFileMetadata.numberOfChunks;
      // Initialize a Uint8Array
      this.fileArray = new Uint8Array(this.receivedFileMetadata.fileByteSize); 
    } catch(e) {
      // We've (hopefully) received part of a file (a chunk).
      // If it's the first data array, set the fileArray with it
      // We maintain an offset so that we can set the arrays correctly
      // Then set the rest of the data arrays into our file array
      // If it's the last data array, we get the blob.

      if (this.receivedChunks == 0) {
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
        this.ref.tick();
        this.makeBlob();
      }
    }
  }

  private makeBlob():void {
    // let u8Array = Uint8Array.from(this.fileArray);
    let blob = new Blob([this.fileArray],
        {type: this.receivedFileMetadata.fileType});
    let url = window.URL.createObjectURL(blob);
    this.unsafeUrl = url;
    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // Set up download prompt
    this.url = safeUrl;
    this.fileReadyForDownload = true;
    this.prompt = "File is ready for download!";
    this.ref.tick();
    this.resetReceiveVariables();
    this.ref.tick();
  }

  private resetReceiveVariables(): void {
    this.fileArray = null;
    this.fileArrayOffset = 0;
    // We don't do filename so that user doesn't have to immediately download it
    // It will get overwritten with the next file anyway.
    //this.fileName = null;
    this.receivedChunks = 0;
    this.maxFileChunks = null;
    this.receivedFileMetadata = null;
  }

  // TODO: Error handling.
  private handlePeerError(err: any): void {
    this.prompt = "Something went wrong! Please try connecting again."
    console.log(err);
  }

  // TODO: Check if return behaviour is correct
  private finishReadingFile(): void {
    this.prompt = 'Finished processing file, now sending!';
    this.ref.tick();
    // Make sure the file has actually been read
    if (this.fileReader.readyState !== 2) {
      this.prompt = 'Something went wrong!';
      return;
    }
    this.chunkAndSendFile();
  }

  private chunkAndSendFile(): void {
    // Make the file into a typed array to send it as the WebRTC API doesn't
    // support sending blobs at this point.
    let fileView = new Uint8Array(this.fileReader.result);
    let fileByteLength = fileView.byteLength;
    // Set number of chunks. We split each file into 60k chunks as simple-peer
    // only supports sending ~64k chunks(?) at one time and does its own
    // splitting otherwise, which throttles the connection.
    let numberOfChunks = Math.ceil(fileByteLength/CHUNK_SIZE);
    // Push chunks into an array
    let chunks = Array(numberOfChunks);
    for (let i = 0; i < numberOfChunks - 1; i++) {
      let chunk = fileView.slice(CHUNK_SIZE*i, CHUNK_SIZE*(i+1));
      chunks.push(chunk);
    }
    // Push final chunk
    chunks.push(fileView.slice(CHUNK_SIZE*(numberOfChunks - 1)));

    // Set up and send metadata for the file
    let metadata = {
      fileName: this.file.name,
      fileType: this.file.type,
      fileSize: this.file.size,
      fileByteSize: fileByteLength,
      numberOfChunks: numberOfChunks,
    };
    let jsonString = JSON.stringify(metadata);
    // Dirty check to make sure metadata isn't too big.
    // TODO: Make sure things can't be circular because JSON.* will break
    if (jsonString.length > CHUNK_SIZE) {
      this.prompt = 'File metadata too big, consider renaming.';
      this.ref.tick();
      return;
    }
    this.peer.send(jsonString);
    
    // Send chunks
    // We use write instead of send as send closes the connection on big files.
    chunks.forEach(element => {
      this.peer.write(element)
    });

  }

  public connectToPeer(): void {
    this.prompt = "Connecting...";
    this.signalClient.connect(this.peerId.trim());
  }

  public getId(): string {
    console.log(this.id);
    return this.id;
  }

  // In case we get id from URL
  public setPeerId(id: string): void {
    this.peerId = id;
  }

  public getPeerId(): string {
    return this.peerId.trim();
  }

  public sendFile(file: File): void {
    this.prompt = "Now processing file!";
    this.file = file;
    this.fileReader.readAsArrayBuffer(file);
  }

  private openConnectionDialog(request: any) :void {
    const dialogRef = this.dialog.open(ConnectionDialog, {
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

}

// Connection dialog component
// TODO: move to component
@Component({
  selector: 'dialog-content-example-dialog',
  template: `
    <h1 mat-dialog-title> User with id {{data.id}} wants to connect to your browser. Accept?</h1>
    <mat-dialog-actions>
    <button mat-raised-button [mat-dialog-close]="true" cdkFocusInitial color='primary'>Yes</button>
    <button mat-raised-button [mat-dialog-close]="false" color='warn'>No</button>
    </mat-dialog-actions>`,
})
export class ConnectionDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}