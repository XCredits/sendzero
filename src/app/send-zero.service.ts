declare var require: any
import { Injectable } from '@angular/core';
import { OnInit, ApplicationRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

let io = require('socket.io-client');
let Peer = require('simple-peer');
let SimpleSignalClient = require('simple-signal-client');
// Simple peer splits files greater that 64k, so we make our lives easier
// by splitting up files ino 60k chunks
let CHUNK_SIZE = 60000
let SERVER_URL = "http://localhost:3000";



@Injectable()
export class SendZeroService {
  // Typed definitions
  id: string;
  peerId: string; 
  prompt: string;
  url: SafeResourceUrl;
  disableConnectButton: boolean; 
  disableSendButton: boolean;
  fileName: string;
  // For progress element
  maxFileChunks: number = 0;
  receivedChunks: number = 0;
  private receivedFileMetadata: {
    fileName: string,
    fileType: string,
    fileSize: number,
    fileByteSize: number,
    numberOfChunks: number,
  };
  private fileArray: Array<Uint8Array>;
  private fileReader: FileReader;
  private file: File;
  
  // Untyped definitions
  private socket: any;
  private signalClient: any;
  private peer: any;

  constructor(private ref: ApplicationRef, private sanitizer: DomSanitizer) {
    this.id = null;
    this.peerId = null;
    this.prompt = "Please wait..."; 
    this.disableConnectButton = true; 
    this.disableSendButton = true; 
   }

  init() {
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

  private handleSignalClientReadyState() {
    this.prompt = "Ready to connect! Enter peer's id below!" 
    this.disableConnectButton = false; 
    this.id = this.signalClient.id;
  }

  // Maybe add more logic here - esp for some domains/IPs
  private handleSignalClientRequest(request: any) {
    request.accept();
  }

  private handleSignalClientPeer(peer: any) {
    this.peer = peer;

    // Set up peer handling functions
    this.peer.on('connect', this.handlePeerConnect.bind(this));
    this.peer.on('data', this.handlePeerReceiveData.bind(this));
    this.peer.on('error', this.handlePeerError.bind(this));
  }

  private handlePeerConnect() {
    this.prompt = 'Now connected to peer! Select a file to send!';
    this.disableSendButton = false;
  }

  // Data always comes in as Uint8Array of size CHUNK_SIZE
  private handlePeerReceiveData(data: Uint8Array) {
    // We first try to convert data to JSON as metadata of the file is always
    // received as JSON.
    // If this doesn't work, then we assume that we've received a file.
    try {
      this.prompt = "Now receiving a file!" 
      // @ts-ignore
      let metadataString = new TextDecoder('utf-8').decode(data);
      this.receivedFileMetadata = JSON.parse(metadataString);
      this.fileName = this.receivedFileMetadata.fileName;
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
        this.ref.tick();
      } else {
        this.fileArray.push(data);
        this.ref.tick();
        this.makeBlob();
      }
    }
  }

  private makeBlob() {
    let blob = new Blob(this.fileArray,
        {type: this.receivedFileMetadata.fileType});
    let url = window.URL.createObjectURL(blob);
    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // Set up download prompt
    this.url = safeUrl;
    // TODO: Revoke URL
    this.prompt = "File is ready for download!";
    this.ref.tick();
    this.resetReceiveVariables();
    this.ref.tick();
  }

  private resetReceiveVariables() {
    this.fileArray = null;
    // We don't do filename so that user doesn't have to immediately download it
    // It will get overwritten with the next file anyway.
    //this.fileName = null;
    this.receivedChunks = 0;
    this.maxFileChunks = null;
    this.receivedFileMetadata = null;
  }

  // TODO: Error handling.
  private handlePeerError(err: any) {
    console.log(err);
  }

  // TODO: Check if return behaviour is correct
  private finishReadingFile() {
    this.prompt = 'Finished processing file, now sending!';
    // Make sure the file has actually been read
    if (this.fileReader.readyState !== 2) {
      this.prompt = 'Something went wrong!';
      return;
    }
    this.chunkAndSendFile();
  }

  private chunkAndSendFile() {
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

  connectToPeer() {
    this.prompt = "Connecting...";
    this.signalClient.connect(this.peerId.trim());
  }

  getId(): string {
    console.log(this.id);
    return this.id;
  }

  getPeerId(): string {
    return this.peerId.trim();
  }

  sendFile(file: File): void {
    this.prompt = "Now processing file!";
    this.file = file;
    this.fileReader.readAsArrayBuffer(file);
  }


}
