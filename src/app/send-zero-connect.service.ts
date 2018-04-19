declare var require: any
import { Injectable } from '@angular/core';
import { OnInit, ChangeDetectorRef } from '@angular/core';
import { Socket } from 'net';
import { DomSanitizer } from '@angular/platform-browser';

let io = require('socket.io-client');
let Peer = require('simple-peer');
let SimpleSignalClient = require('simple-signal-client');
// Simple peer splits files greater that 64k, so we make our lives easier
// by splitting up files ino 60k chunks
let CHUNK_SIZE = 60000
let SERVER_URL = "http://localhost:3000";



@Injectable()
export class SendZeroConnectService implements OnInit {
  // Typed definitions
  socket: Socket;
  id: string;
  peerId: string;
  prompt: string;
  enableConnectButton: boolean;
  enableSendButton: boolean;
  receivedFileMetadata: {
    fileName: string,
    fileType: string,
    fileSize: number,
    fileByteSize: number,
    numberOfChunks: number,
  };
  fileArray: Array<Uint8Array>;
  // For progress element
  maxFileChunks: number = 0;
  receivedChunks: number = 0;
  fileReader: FileReader;
  file: File;
  
  // Untyped definitions
  signalClient;
  peer;

  constructor(private ref: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.id = null;
    this.prompt = "Please wait...";
    this.enableConnectButton = false;
    this.enableSendButton = false;
   }

  ngOnInit() {
    var self = this;
    
    // Set up socket
    this.socket = io(SERVER_URL);

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

  handleSignalClientReadyState() {
    this.id = this.signalClient.id;
    this.prompt = "Ready to connect! Enter peer's id below!"
    this.enableConnectButton = true;
  }

  // Maybe add more logic here - esp for some domains/IPs
  handleSignalClientRequest(request: any) {
    request.accept();
  }

  handleSignalClientPeer(peer: any) {
    this.peer = peer;

    // Set up peer handling functions
    this.peer.on('connect', this.handlePeerConnect.bind(this));
    this.peer.on('data', this.handlePeerReceiveData.bind(this));
    this.peer.on('error', this.handlePeerError.bind(this));
  }

  handlePeerConnect() {
    this.prompt = 'Now connected to peer!'
  }

  // Data always comes in as Uint8Array of size CHUNK_SIZE
  handlePeerReceiveData(data: Uint8Array) {
    // We first try to convert data to JSON as metadata of the file is always
    // received as JSON.
    // If this doesn't work, then we assume that we've received a file.
    try {
      let metadataString = new TextDecoder('utf-8').decode(data);
      this.receivedFileMetadata = JSON.parse(metadataString);
      // Set up maxFileChunks for expected file - we do this for the progress
      // element
      this.maxFileChunks = this.receivedFileMetadata.numberOfChunks;
      // Initialize an Array, this saves memory and is much quicker than
      // dynamically pushing
      this.fileArray = Array(this.maxFileChunks); 
    } catch(e) {
      // We've (hopefully) received part of a file (a chunk).
      // Start pushing the data arrays into our file array
      // If it's the last data array, we get the blob.
      if (this.receivedChunks < this.maxFileChunks - 1) {
        this.fileArray.push(data);
        this.receivedChunks++;
        // This is because Angular doesn't detect changes in callbacks.
        this.ref.detectChanges();
      } else {
        this.fileArray.push(data);
        this.ref.detectChanges();
        this.makeBlob();
      }
    }
  }

  makeBlob() {
    let blob = new Blob(this.fileArray,
        {type: this.receivedFileMetadata.fileType});
    let url = window.URL.createObjectURL(blob);
    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // Set up download prompt
    // TODO: Revoke URL

    this.resetReceiveVariables(); 
  }

  resetReceiveVariables() {
    this.fileArray = null;
    this.enableSendButton = false;
    this.receivedChunks = 0;
    this.maxFileChunks = null;
    this.receivedFileMetadata = null;
  }

  // TODO: Error handling.
  handlePeerError(err: any) {
    console.log(err);
  }

  // TODO: Check if return behaviour is correct
  finishReadingFile() {
    this.prompt = 'Finished processing file, now sending!';
    // Make sure the file has actually been read
    if (this.fileReader.readyState !== 2) {
      this.prompt = 'Something went wrong!';
      return;
    }
    this.chunkAndSendFile();
  }

  chunkAndSendFile() {
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
      this.prompt = 'File metadata too big, consider renaming.'
      return;
    }
    this.peer.send(jsonString);
    
    // Send chunks
    // We use write instead of send as send closes the connection on big files.
    chunks.forEach(element => { 
      this.peer.write(element)
    })
  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);
    this.enableSendButton = true;
  }

  connectPeers() {
    this.signalClient.connect(this.peerId);
  }



}
