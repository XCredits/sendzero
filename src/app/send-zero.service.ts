declare var require: any;
import { Injectable, Component, Inject } from '@angular/core';
import { OnInit, ApplicationRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ResolveEnd } from '@angular/router/src/events';
// TODO: find out why import doesn't work
const shortid = require('shortid');
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
  public peerToConnectTo: string;
  public prompt: string;
  public connectionPrompt: string;
  public disableConnectButton: boolean;
  public disableSendButton: boolean;
  public selectedPeer: string;

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
    this.prompt = 'Successfully connected to ' + peer.id;
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
  private handlePeerReceiveData(data: any): void {
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
      // const messageOrDataString = new TextDecoder('utf-8').decode(data);
      console.log(data);
      // const messageOrDataString = String.fromCharCode.apply(null, data);
      const messageOrDataString = data;
      console.log(messageOrDataString.length);
      const receivedData = JSON.parse(messageOrDataString, (key, value) => {
        if (value.constructor === Array) {
          const array = new Uint8Array(value.length);
              for (let i = 0; i < value.length; i++) {
                array[i] = value[i];
              }
          return array;
        }
        return value;
      });
      // Various cases
      // 1. We receive a message saying we can continue sending file (after
      // we've sent file metadata through)
      // 2. We receive a message saying we cannot send the file (after we've
      // sent file metadata through)
      // 3. The file we wanted to send was successfully received by the peer.
      // 4. We're receiving an actual metadata object and we have to ask the
      // user if they want to accept the file by opening the dialog
      // 5. We're receiving file data.
      if (receivedData.type === 'MESSAGE'
          && receivedData.message === 'File Accepted') {
        // We can now continue sending our file.
        this.sendChunkedFile(receivedData.from, receivedData.fileId);
      } else if (receivedData.type === 'MESSAGE'
          && receivedData.message === 'File Declined') {
        // We should now clear all file related variables in our state.
        this.peers[receivedData.from].prompt
            = 'Peer did not accept the file! Please try again.';
        this.disableSendButton = false;
        this.ref.tick();
        // We now remove file from list of files for the peer that rejected us
        const fileToRemove = this.peers[receivedData.from].files
            .find(f => f.id === receivedData.fileId);
        const index = this.peers[receivedData.from].files.indexOf(fileToRemove);
        this.peers[receivedData.from].files.splice(index, 1);
      } else if (receivedData.type === 'MESSAGE'
          && receivedData.message === 'File Received') {
        // We can now remove the file from our memory and also allow other files
        // to be sent
        const peerId = receivedData.from;
        const fileId = receivedData.fileId;
        this.disableSendButton = false;
        this.peers[peerId].prompt = 'Finished sending file!';
        const fileToRemove = this.peers[peerId]
            .files
            .find(f => f.id === fileId);
        const index = this.peers[peerId].files.indexOf(fileToRemove);
        this.peers[peerId].files.splice(index, 1);
        this.ref.tick();
      } else if (receivedData.type === 'METADATA') {
        // Reassign (deep copy) rather than fileMetadata = receivedFileMetaData
        const fileMetadata = JSON.parse(messageOrDataString);
        // Prepare for a new file but initializing variables like id, name, etc.
        // TODO: Move this to dialog component
        this.peers[receivedData.from]
            .files
            .push({
              id: fileMetadata.fileId,
              name: fileMetadata.fileName,
              size: fileMetadata.fileSize,
              type: fileMetadata.fileType,
              // Initialize a Uint8Array
              fileArray: new Uint8Array(fileMetadata.fileByteSize),
              receivedChunks: 0,
              fileArrayOffset: 0,
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
        // The "chunk" in the object was a string. We now need to convert that
        // string back to a UInt8Array.
        // @ts-ignore
        const chunk = new TextEncoder('utf-8').encode(receivedData.chunk);
        if (file.receivedChunks === 0) {
          file.fileArray.set(chunk);
          file.fileArrayOffset = CHUNK_SIZE;
          file.receivedChunks++;
          this.ref.tick();
          // If we had a file < CHUNK_SIZE, we only got one chunk, so exit now.
          if (file.maxFileChunks === 1) {
            this.makeBlob(receivedData.from, file.id);
          }
        } else if (file.receivedChunks < file.maxFileChunks - 1) {
          file.fileArray.set(chunk, file.fileArrayOffset);
          file.fileArrayOffset += CHUNK_SIZE;
          file.receivedChunks++;
          // This is because Angular doesn't detect changes in callbacks.
          this.ref.tick();
        } else {
          file.fileArray.set(chunk, file.fileArrayOffset);
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
    // Before making a blob we send a message to the peer that we
    // have received the (complete) file.
    this.peers[peerId].peer.send(JSON.stringify({
      type: 'MESSAGE',
      message: 'File Received',
      from: this.id,
      to: peerId,
      fileId: fileId
    }));
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
    const fileId = shortid.generate();
    const peerId = this.selectedPeer;
    this.peers[peerId].prompt = 'Now processing file!';
    this.peers[peerId].files.push({
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size
    });
    this.readFileAsArrayBuffer(file, peerId)
        .then(fileArrayBuffer => {
          this.finishReadingFile(peerId, fileId, fileArrayBuffer);
        })
        .catch(err => {
          this.peers[peerId].prompt
              = 'There was an error while processing the file. Please try again or contact us.';
        });
  }

  private readFileAsArrayBuffer(file: File, peerId: string) {
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
    this.peers[peerId].prompt
        = 'Finished processing file. Waiting for confirmation from peer!';
    // Don't allow the user to send any files for the timebeing
    this.disableSendButton = true;
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
    file.chunks = Array(numberOfChunks);
    // Assign chunks
    for (let i = 0; i < numberOfChunks - 1; i++) {
      const chunk = fileView.slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
      file.chunks[i] = chunk;
    }
    // Assign final chunk
    file.chunks[numberOfChunks - 1] =
        (fileView.slice(CHUNK_SIZE * (numberOfChunks - 1)));

    // Set up and send metadata for the file
    const metadata = {
      fileName: file.name,
      type: 'METADATA',
      from: this.id,
      to: peerId,
      fileId: file.id,
      fileType: file.type,
      fileSize: file.size,
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
    // this.peers[peerId].peer.send(metadata);
  }

  private sendChunkedFile(peerId: string, fileId: string): void {
    this.peers[peerId].prompt = 'Received confirmation, now sending file!';
    this.ref.tick();
    // Find file
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    // Send chunks
    let chunk;
    // @ts-ignore
    const decoder = new TextDecoder('utf-8');
    while ((chunk = file.chunks.shift()) !== undefined) {
      const toSend = {
        type: 'FILE',
        fileId: file.id,
        from: this.id,
        to: peerId,
        chunk: chunk,
      };
      // We convert the chunk (which is a UInt8Array) to a string as
      // JSON.stringify will convert it to an object (which increases its size
      // 10x). the converted string will be the same size and also preserve the
      // array.
      // toSend.chunk = decoder.decode(chunk);
      // toSend.chunk = String.fromCharCode.apply(null, chunk);
      // @ts-ignore
      // const encoder = new TextEncoder('utf-8');
      // const string = [];
      // for (let i = 0; i < toSend.chunk.length; i++) {
      //   string[i] = toSend.chunk.codePointAt(i);
      // }
      const toSendString = JSON.stringify(toSend, (key, value) => {
        if (value.constructor === Uint8Array) {
          return  Array.from(value);
        }
        return value;
      });
      // console.log(toSendString);
      // console.log(toSend.chunk.length);
      // console.log(toSend.chunk.length, JSON.stringify(toSend.chunk).length, JSON.stringify(toSend).length);
      // console.log(JSON.stringify(toSend).length);
      // We use write instead of send as send closes the connection on big
      // files.
      // this.peers[peerId].peer.write(JSON.stringify(toSend));
      this.peers[peerId].peer.write(toSendString);
    }
    this.ref.tick();
  }

  public connectToPeer(): void {
    this.prompt = 'Connecting...';
    this.signalClient.connect(this.peerToConnectTo.trim(), {objectMode: true});
  }

  public getId(): string {
    console.log(this.id);
    return this.id;
  }

  // In case we get id from URL
  public setConnectToPeerId(id: string): void {
    this.peerToConnectTo = id;
    this.ref.tick();
  }

  private openConnectionDialog(request: any): void {
    const dialogRef = this.dialog.open(ConnectionDialogComponent, {
      data: {id: request.id},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        request.accept({objectMode: true});
      } else {
        this.socket.emit('request declined', request);
      }
    });
  }

  private openReceiveFileDialog(metadata: any): void {
    this.ref.tick();
    const peerId = metadata.from;
    const fileId = metadata.fileId;
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    const dialogRef = this.dialog.open(ReceiveFileDialogComponent, {
      data: metadata,
    });
    this.ref.tick();
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.peers[peerId].peer.send(JSON.stringify({
          type: 'MESSAGE',
          message: 'File Accepted',
          from: this.id,
          to: peerId,
          fileId: fileId
        }));
        file.fileReadyForDownload = false;
        // Set up maxFileChunks for expected file - we do this for the progress
        // element
        file.maxFileChunks = metadata.numberOfChunks;
      } else {
        this.peers[peerId].peer.send(JSON.stringify({
          type: 'MESSAGE',
          message: 'File Declined',
          from: this.id,
          to: peerId,
          fileId: fileId
        }));
        // Rmeove that file object because the file was declined
        const index = this.peers[peerId].files.indexOf(file);
        this.peers[peerId].files.splice(index, 1);
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
    <h1 mat-dialog-title> User with id {{data.from}} wants to send you a file. Accept?</h1>
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

