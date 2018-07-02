declare var require: any;
import { Injectable, Component, Inject, ViewChild } from '@angular/core';
import { OnInit, ApplicationRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTable, MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { SignalService } from './signal.service';
import { isEmpty } from 'lodash';
// import { UserService } from './user.service';
// TODO: find out why import doesn't work
const shortid = require('shortid');
const io = require('socket.io-client');
// const Peer = require('simple-peer');
// const SimpleSignalClient = require('simple-signal-client');

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
  public disableFileSending = false;
  public humanId: number;
  // public user: User;
  // public isLoggedIn: boolean;


  // Untyped definitions
  private socket: any;
  // Maybe interface this
  private peers: any;
  public peerSubject = new BehaviorSubject(this.peers);

  constructor(private ref: ApplicationRef,
              private signalService: SignalService,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog,
              public snackBar: MatSnackBar) {
    this.id = '';
    this.prompt = 'Please wait...';
    this.disableConnectButton = true;
    this.humanId = Math.floor(99 * Math.random()) + 1;
   }

  public init(): void {
    const self = this;

    // Peers is an object keyed by the ids of the peers connected to you.
    // The value is another object that contains the peer object, file(s) info,
    // etc.
    this.peers = {};
    // We only send the object once as BehaviourSubject will get triggered
    // every time the object changes
    this.peerSubject.next(this.peers);

    // Set up socket
    this.socket = io(SERVER_URL, {transports: ['websocket']});
    this.socket.on('request declined', (request) => {
      if (request.id === this.id) {
        this.snackBar.open('The user declined your request!', 'Dismiss', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });
      }
      delete this.peers[request.declinedBy];
      this.ref.tick();
    });
    this.socket.on('peer disconnected', (peerId) => {
      if (Object.keys(this.peers).includes(peerId)) {
        delete this.peers[peerId];
        this.snackBar.open('User ' + peerId + ' has disconnected!', 'Dismiss', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });
      }
    });

    // Set up signal client
    // this.signalClient = new SimpleSignalClient(this.socket);
    this.signalService.init(this.socket);

    // Set up signal client's handler functions
    // this.signalService.on('ready', this.handleSignalClientReadyState.bind(this));
    this.signalService.signal.subscribe(data => {
      if (isEmpty(data)) {
        return;
      }

      switch (data.event) {
        case 'ready':
          this.handleSignalClientReadyState.bind(this)();
          break;
        case 'request':
          this.handleSignalClientRequest.bind(this)(data.request);
          break;
        case 'peer':
          this.handleSignalClientPeer.bind(this)(data.peer);
          break;
        default:
          break;
      }
    });
    // this.signalService.on('request', this.handleSignalClientRequest.bind(this));
    // this.signalService.on('peer', this.handleSignalClientPeer.bind(this));
  }

  private handleSignalClientReadyState(): void {
    this.prompt = 'Ready to connect to other computers! Enter a peer\'s ID below to connect to them.';
    this.id = this.signalService.id;
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
    this.snackBar.open('Successfully connected to ' + peer.id, 'Dismiss', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
    this.disableFileSending = false;
    // Set up peer handling functions
    peer.on('connect', () => this.handlePeerConnect.bind(this)(peer));
    peer.on('close', this.handlePeerClose.bind(this));
    peer.on('data', this.handlePeerReceiveData.bind(this));
    peer.on('error', this.handlePeerError.bind(this));
  }

  private handlePeerConnect(peer: any): void {
    this.peers[peer.id].prompt = 'Now connected to peer! Select a file to send!';
    this.peerToConnectTo = '';
    this.ref.tick();
  }

  private handlePeerClose(): void {
    console.log('Connection closed');
  }

  // Data always comes in as Uint8Array
  private handlePeerReceiveData(dataString: string): void {
    // All data comes in as a  string which is parsed as a JSON object. (The
    // process is complicated due to limitations of simple-peer).
    // The object can be a message (whether the file has been accepted or
    // rejected, etc) or a message with file data. Every piece of data SHOULD
    // have a 'type' field. This can be "MESSAGE", "METADATA" or "FILE".
    // The first 5 chars of every object denote the size of the object that it
    // carries. For "FILE" type, the data string is appended after the object.
    // Ideally every object should also have a "from" and "to" field to prevent
    // interceptions.
    // If the parsing fails, we show an error.
    try {
      // console.log(dataString);
      // We first obtain the size of the message.
      const msgSize = parseInt(dataString.slice(0, 5), 10);
      // We only parse the stringified object now.
      const messageString = dataString.slice(5, 5 + msgSize);
      const receivedData = JSON.parse(messageString);
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
        const fileMetadata = JSON.parse(messageString);
        // Prepare for a new file but initializing variables like id, name, etc.
        // TODO: Move this to dialog component
        this.peers[receivedData.from]
            .files
            .push({
              id: fileMetadata.fileId,
              name: fileMetadata.fileName,
              size: fileMetadata.fileSize,
              type: fileMetadata.fileType,
              receivedChunks: 0,
            });
        this.ref.tick();
        this.openReceiveFileDialog(fileMetadata);
      } else if (receivedData.type === 'FILE') {
        // We've (hopefully) received part of a file (a chunk).
        // Each chunk is a string. When all these chunks are put together
        // we get a strigified array which we convert back to an Array.
        // This array is then converted to a typed array and then a blob.

        // If it's the first piece of data, set the fileString with it
        // Then concat the chunks as they come in.
        // If it's the last data string, we get the blob.

        // Objects in javascript are just references
        // We can just change "file" here, and it will change the actual object
        // Which is a pain to reference every single time.
        const file = this.peers[receivedData.from]
            .files
            .find(f => f.id === receivedData.fileId);
        // The "chunk" in the object was a string. We now need to convert that
        // string back to an array.
        // @ts-ignore
        const chunk = dataString.slice(5 + msgSize);
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
      this.snackBar.open('Something went wrong! Please try again or get in touch with us!', 'Dismiss', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
    }
  }

  private makeBlob(peerId: string, fileId: string): void {
    // Before making a blob we send a message to the peer that we
    // have received the (complete) file.
    const toSend = {
      type: 'MESSAGE',
      message: 'File Received',
      from: this.id,
      to: peerId,
      fileId: fileId
    };
    const toSendString = JSON.stringify(toSend);
    this.peers[peerId]
            .peer
            .send(padWithZeroes(toSendString.length, 5) + toSendString);
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    // Create blob out of array parsed from fileString.
    const blob = new Blob([file.fileArray], {type: file.type});
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
    this.snackBar.open('Something went wrong! Please try again or get in touch with us!', 'Dismiss', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
    console.log(err);
  }

  public sendFile(file: File, peer: string): void {
    const fileId = shortid.generate();
    const peerId = peer;
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
    // // Don't allow the user to send any files for the timebeing
    // this.disableSendButton = true;
    this.ref.tick();
    this.peers[peerId]
        .files.find(f => f.id === fileId)
        .fileArray = fileArrayBuffer;
    this.chunkFileAndSendMetadata(peerId, fileId);
  }

  private chunkFileAndSendMetadata(peerId: string, fileId: string): void {
    // Find file
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    // We make the file into a typed array which will be converted to a
    // string as the WebRTC API doesn't support sending blobs at this point.
    // Set number of chunks. We split each file into 60k chunks as simple-peer
    // only supports sending ~62k(?) chunks at one time and does its own
    // splitting otherwise, which is difficult to account for always.
    // Note that we don't directly chunk the file by using "slice".
    // We first convert the  Uint8Array to a normal array, and this array in
    // turn is converted to a string using JSON.stringify(). We then chunk
    // this string into 60k chunks. This is because first chunking and then
    // converting to a string gives a string of non-deterministic size that may
    // go past the allowed ~62k that simple-peer allows us to send at once.
    // We also want to send every "chunk" wrapped in an object with metadata,
    // and since we can't send objects, we first have to stringify them.
    // @ts-ignore
    const fileData = new Uint8Array(file.fileArray);
    const fileByteLength = fileData.byteLength;
    const numberOfChunks = Math.ceil(fileByteLength / CHUNK_SIZE);
    // Pre allocate arrays as assigning chunks is faster than
    // pushing chunks into an array
    file.chunks = Array(numberOfChunks);
    // Assign chunks
    for (let i = 0; i < numberOfChunks - 1; i++) {
      const chunk = fileData.slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
      file.chunks[i] = chunk;
    }
    // Assign final chunk
    file.chunks[numberOfChunks - 1] =
        (fileData.slice(CHUNK_SIZE * (numberOfChunks - 1)));

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
    // Dirty check to make sure metadata isn't too big, since we only allow
    // 5 chars for tracking the size of the message.
    // TODO: Make sure things can't be circular because JSON.Parse/stringify
    // will break
    if (jsonString.length > 99999) {
      this.snackBar.open('File metadata is too big, consider renaming.', 'Dismiss', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
      this.ref.tick();
      return;
    }
    this.peers[peerId]
            .peer
            .send(padWithZeroes(jsonString.length, 5) + jsonString);
  }

  private sendChunkedFile(peerId: string, fileId: string): void {
    this.peers[peerId].prompt = 'Received confirmation, now sending file!';
    this.ref.tick();
    // Find file
    const file = this.peers[peerId].files.find(f => f.id === fileId);
    // Send chunks
    let chunk;
    while ((chunk = file.chunks.shift()) !== undefined) {
      const chunkData = {
        type: 'FILE',
        fileId: file.id,
        from: this.id,
        to: peerId,
      };
      // The chunk is a utf-8 decoded string, so we will append it after the
      // JSON object (which will be stringified). To know how to recover this
      // data on the other end, we need to know when the data string starts
      // So the first 5 chars of the string we send will contain the size of
      // the stringified JSON. The receiver can then cut the size chars and
      // the JSON out, and then do whatever it needs to with the data string.

      // Start by Stringifying the object
      const chunkDataString = JSON.stringify(chunkData);
      // We pad using 0s and only 5 chars for the size, as the object will be
      // quite small.
      const sizeString = padWithZeroes(chunkDataString.length, 5);
      // Now make the whole string to send
      const messageString = sizeString + chunkDataString;
      // @ts-ignore
      const messageArray = new TextEncoder('utf-8').encode(messageString);
      const toSendArray
          = new Uint8Array(chunk.length + messageArray.byteLength);
      toSendArray.set(messageArray);
      toSendArray.set(chunk, messageArray.byteLength);
      // We use write instead of send as send closes the connection on big
      // files.
      this.peers[peerId].peer.write(toSendArray);
    }
    this.ref.tick();
  }

  public connectToPeer(): void {
    const peerId = this.peerToConnectTo.trim();
    this.peers[peerId] = {
      prompt: 'Trying to connect to peer. '
          + 'If you\'re unable to connect after a few minutes, '
          + 'please check that you have entered the ID correctly.'
    };
    if (Object.keys(this.peers).length === 1) {
      this.disableFileSending = true;
      this.ref.tick();
    }
    this.signalService.connect(this.peerToConnectTo.trim());
  }

  public getId(): string {
    return this.id;
  }

  // In case we get id from URL
  public setConnectToPeerId(id: string): void {
    this.peerToConnectTo = id;
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
        const toSend = {
          type: 'MESSAGE',
          message: 'File Accepted',
          from: this.id,
          to: peerId,
          fileId: fileId
        };
        const toSendString = JSON.stringify(toSend);
        this.peers[peerId]
            .peer
            .send(padWithZeroes(toSendString.length, 5) + toSendString);
        file.fileReadyForDownload = false;
        // Set up maxFileChunks for expected file - we do this for the progress
        // element
        file.maxFileChunks = metadata.numberOfChunks;
        // Initialize fileArray to receive data
        file.fileArray = new Uint8Array(file.size);
        file.fileArrayOffset = 0;
      } else {
        const toSend = {
          type: 'MESSAGE',
          message: 'File Declined',
          from: this.id,
          to: peerId,
          fileId: fileId
        };
        const toSendString = JSON.stringify(toSend);
        this.peers[peerId]
            .peer
            .send(padWithZeroes(toSendString.length, 5) + toSendString);
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

/**
 *
 * @param num number that needs to padded
 * @param padding to how many digits num should be padded to
 */
function padWithZeroes(num: number, padding: number): string {
  const padString = '0'.repeat(padding);
  return (padString + num).slice(-padString.length);
}

