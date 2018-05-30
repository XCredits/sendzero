declare var require: any;
import { Injectable, Component, Inject } from '@angular/core';
import { OnInit, ApplicationRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ResolveEnd } from '@angular/router/src/events';
import { shortid } from 'shortid';



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
  public prompt: string;
  public connectionPrompt: string;
  public disableConnectButton: boolean;

  // Untyped definitions
  private socket: any;
  private signalClient: any;
  // Maybe interface this
  private peers: any;

  constructor(private ref: ApplicationRef,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog) {
    this.id = '';
    this.prompt = 'Please wait...';
    this.disableConnectButton = true;
   }

  public init(): void {
    const self = this;

    // Peers is an object keyed by the ids of the peers connected to you.
    // The value is another object that contains the peer object, file(s) info,
    // etc.
    this.peers = {};

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
    // Add to peers list
    this.peers[peer.id] = {
      peer: peer,
      id: peer.id,
      files: [],
      prompt: 'Connected to peer!'
    };
    // Set up peer handling functions
    peer.on('connect', () => this.handlePeerConnect.bind(this)(peer));
    peer.on('data', this.handlePeerReceiveData.bind(this));
    peer.on('error', this.handlePeerError.bind(this));
  }

  private handlePeerConnect(peer: any): void {
    this.peers[peer.id].prompt = 'Now connected to peer! Select a file to send!';
    this.ref.tick();
  }

  // Data always comes in as Uint8Array
  private handlePeerReceiveData(data: Uint8Array): void {
    // All data comes in as an Uint8Array which is then converted to a string
    // which in turn is parsed as a JSON object. (The process is complicated
    // due to limitations of simple-peer).
    // The object can be a message (whether the file has been accepted or
    // rejected, etc) or the file data itself. Every piece of data SHOULD have
    // a 'type' field. This can be "MESSAGE", "METADATA" or "FILE"
    // Ideally it should also have a "from" and "to" field to prevent
    // interceptions.
    // If the parsing fails, we show an error.
    try {
      // @ts-ignore
      const messageOrDataString = new TextDecoder('utf-8').decode(data);
      const receivedData = JSON.parse(messageOrDataString);
      // Various cases
      // 1. We receive a message saying we can continue sending file (after
      // we've sent file metadata through)
      // 2. We receive a message saying we cannot send the file (after we've
      // sent file metadata through)
      // 3. We're receiving an actual metadata object and we have to ask the
      // user if they want to accept the file by opening the dialog
      // 4. We're receiving file data.
      if (receivedData.type === 'MESSAGE'
          && receivedData.message === 'File Accepted') {
        // We can now continue sending our file.
        this.sendChunkedFile(receivedData.from, receivedData.fileId);
      } else if (receivedData.type === 'MESSAGE'
          && receivedData.message === 'File Declined') {
        // We should now clear all file related variables in our state.
        this.peers[receivedData.from].prompt
            = 'Peer did not accept the file! Please try again.';
        this.ref.tick();
        const fileToRemove = this.peers[receivedData.from].files
            .find(f => f.id === receivedData.fileId);
        const index = this.peers[receivedData.from].files.indexOf(fileToRemove);
        this.peers[receivedData.from].files.splice(index, 1);
      } else if (receivedData.type === 'METADATA') {
        // Reassign (deep copy) rather than fileMetadata = receivedFileMetaData
        const fileMetadata = JSON.parse(receivedData);
        // Prepare for a new file but initializing variables like id, name, etc.
        this.peers[receivedData.from]
            .files
            .push({
              id: fileMetadata.id,
              name: fileMetadata.name,
              size: fileMetadata.size,
              readyForDownload: false,
              // Initialize a Uint8Array
              fileArray: new Uint8Array(fileMetadata.fileByteSize),
              receivedChunks: 0,
              fileArrayOffset: 0,
              maxFileChunks: fileMetadata.maxFileChunks
            });
        this.ref.tick();
        this.openReceiveFileDialog(fileMetadata);
      } else if (receivedData.type === 'FILE') {
        // We've (hopefully) received part of a file (a chunk).
        // If it's the first data array, set the fileArray with it
        // We maintain an offset so that we can set the arrays correctly
        // Then set the rest of the data arrays into our file array
        // If it's the last data array, we get the blob.

        // Objects in javascript are just references
        // We can just change "file" here, and it will change the actual object
        // Which is a pain to reference every single time.
        const file = this.peers[receivedData.from]
            .files
            .find(f => f.id === receivedData.fileId);
        if (file.receivedChunks === 0) {
          file.fileArray.set(data);
          file.fileArrayOffset = CHUNK_SIZE;
          file.receivedChunks++;
          this.ref.tick();
          // If we had a file < 60kb, we only got one chunk, so exit now.
          if (file.maxFileChunks === 1) {
            this.makeBlob(receivedData.from, file.id);
          }
        } else if (file.receivedChunks < file.maxFileChunks - 1) {
          file.fileArray.set(data, file.fileArrayOffset);
          file.fileArrayOffset += CHUNK_SIZE;
          file.receivedChunks++;
          // This is because Angular doesn't detect changes in callbacks.
          this.ref.tick();
        } else {
          file.fileArray.set(data, file.fileArrayOffset);
          file.receivedChunks++;
          this.ref.tick();
          this.makeBlob(receivedData.from, file.id);
        }
      }
    } catch (e) {
      console.log(e);
      this.prompt = 'Things broke! Please try again or get in touch with us!';
    }
  }

  private makeBlob(peerId: string, fileId: string): void {
    // let u8Array = Uint8Array.from(this.fileArray);
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    const blob = new Blob([file.fileArray],
        {type: file.type});
    const url = window.URL.createObjectURL(blob);
    file.unsafeUrl = url;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // Set up download prompt
    file.url = safeUrl;
    file.fileReadyForDownload = true;
    this.peers[peerId].prompt = 'File is ready for download!';
    this.ref.tick();
    // Resetting the variables is now done when another file is received
    // This is to prevent file info from getting erased immadietaly after it
    // arrives.
    // this.resetReceiveVariables();
    this.ref.tick();
  }

  private resetReceiveVariables(peerId: string, fileId: string): void {
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    file.fileArray = null;
    file.fileArrayOffset = 0;
    file.fileName = null;
    file.receivedChunks = 0;
    file.maxFileChunks = 0;
    file.metadata = null;
  }

  // TODO: Error handling.
  private handlePeerError(err: any): void {
    this.prompt = 'Something went wrong! Please try connecting again.';
    console.log(err);
  }

  public sendFile(file: File): void {
    this.prompt = 'Now processing file!';
    const fileId = shortid.generate();
    this.peers[peerId].files.push({
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size
    });
    this.readFileAsArrayBuffer(file, peerId, fileId)
        .then(fileArrayBuffer => {
          this.finishReadingFile(peerId, fileId, fileArrayBuffer);
        })
        .catch(err => {
          this.peers[peerId].prompt
              = 'There was an error while processing the file. Please try again or contact us.';
        });
  }

  private readFileAsArrayBuffer(file: File, peerId: string, fileId: string) {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort();
        reject();
      };

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  private finishReadingFile(peerId: string, fileId: string,
      fileArrayBuffer: any): void {
    this.peers[peerId].prompt = 'Finished processing file. Waiting for confirmation from peer!';
    this.ref.tick();
    this.peers[peerId]
        .files.find(f => f.id === fileId)
        .fileArray = fileArrayBuffer;
    this.chunkFileAndSendMetadata(peerId, fileId);
  }

  private chunkFileAndSendMetadata(peerId: string, fileId: string): void {
    // Find file
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    // Make the file into a typed array to send it as the WebRTC API doesn't
    // support sending blobs at this point.
    const fileView = new Uint8Array(file.fileArray);
    const fileByteLength = fileView.byteLength;
    // Set number of chunks. We split each file into 60k chunks as simple-peer
    // only supports sending ~64k(?) chunks at one time and does its own
    // splitting otherwise, which throttles the connection.
    const numberOfChunks = Math.ceil(fileByteLength / CHUNK_SIZE);
    // Pre allocate arrays as assigning chunks is faster than
    // pushing chunks into an array
    file.fileChunks = Array(numberOfChunks);
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
    this.peers[peerId].peer.send(jsonString);

    // Save chunked file
    file.chunks = chunks;
  }

  private sendChunkedFile(peerId: string, fileId: string): void {
    this.peers[peerId].prompt = 'Received confirmation, now sending file!';
    this.ref.tick();
    // Find file
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    // Send chunks
    // We use write instead of send as send closes the connection on big files.
    let chunk;
    while ((chunk = file.chunks.shift()) !== undefined) {
      this.peers[peerId].peer.write(chunk);
    }
    this.peers[peerId].prompt = 'Finished sending file!';
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

