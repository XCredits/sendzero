declare var require: any
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

let io = require('socket.io-client');
let Peer = require('simple-peer');
let SimpleSignalClient = require('simple-signal-client');
let chunkSize = 60000
// import SimpleSignalClient from 'simple-signal-client';
// let socket = io();
// import Peer from 'simple-peer';

// let signalClient = new SimpleSignalClient(socket);


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string;
  peer;
  offer;
  connection;
  messages: {data: string, sender: string, type: string}[];
  file: File = null;
  url = null;
  fileType;
  id: string;
  peerId: string;
  prompt: string;
  
  connectButton = null;
  disconnectButton = null;
  sendButton = null;
  messageBox = null;
  receiveBox = null;
  fileBox = null;
  sendFileButton = null;
  reader;
  socket;
  signalClient;
  fileArray;
  receiveFileMetadata;
  receiveFileName;
  receivedChunkCounter = 0;  
  fileProgress = 0;
  maxFileChunks = 1;

  constructor(private ref: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.title = 'SendZero Alpha';
    var self = this;
    // this has to change
    this.socket = io("http://localhost:3000");
    this.signalClient = new SimpleSignalClient(this.socket);
    this.signalClient.on('ready', function() {
      // self.signalClient.connect();
      self.id = self.signalClient.id;
      self.prompt = "Enter peer's id below";
      self.connectButton.disabled = false;
    });
    this.signalClient.on('request', function (request) {
      console.log('request received');
      request.accept(); // Accept a request to connect
    });
    this.signalClient.on('peer', function (peer) {
      //peer // A fully signalled SimplePeer object
      // console.log(peer);
      self.sendButton.disabled = false;
      self.messageBox.disabled = false;
      self.peer = peer;
      // Use as you would any SimplePeer object
      peer.on('connect', function () {
        console.log('CONNECTED');
      })
      peer.on('data', function(data) {
        // @ts-ignore
        // console.log(JSON.parse(new TextDecoder('utf-8').decode(data)));
        try {
          // @ts-ignore
          self.receiveFileMetadata = JSON.parse(new TextDecoder('utf-8').decode(data));
          self.maxFileChunks = self.receiveFileMetadata.numberOfChunks;
          self.fileArray = Array(self.receiveFileMetadata.numberOfChunks);
          console.log(self.receiveFileMetadata);
        } catch(e) {
          let message = {
            "data": "file",
            "sender": "peer",
            "type": "file",
          }
          if (self.receivedChunkCounter < self.receiveFileMetadata.numberOfChunks - 1) {
            self.fileArray.push(data);
            self.fileProgress++;
            self.receivedChunkCounter++;
            self.ref.detectChanges();
          } else {
            self.fileArray.push(data);            
            console.log(self.fileArray);
            self.messages.push(message);
            self.ref.detectChanges();
            self.getBlob();
          }
        }
      })
      peer.on('error', function (err) { console.log('error', err) })
    })
    this.messages = [];
    this.reader = new FileReader();
    this.reader.onload = function () {
      console.log('Finished reading the file');
      console.log(self.reader.readyState);
      let fileView = new Uint8Array(self.reader.result);
      console.log(fileView.byteLength);
      let fileByteLength = fileView.byteLength;
      let numberOfChunks = Math.ceil(fileByteLength/chunkSize);
      let chunks = [];
      for (let i = 0; i < numberOfChunks - 1; i++) {
        chunks.push(fileView.slice(chunkSize*i, chunkSize*(i+1)))
      }
      chunks.push(fileView.slice(chunkSize*(numberOfChunks-1)));
      console.log(chunks);
      let metadata = {
        fileName: self.file.name,
        fileType: self.file.type,
        fileSize: self.file.size,
        fileByteSize: fileByteLength,
        numberOfChunks: numberOfChunks,
      };
      self.peer.send(JSON.stringify(metadata));
      chunks.forEach(element => {
        self.peer.write(element);  
      });
    }
  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);
    this.sendFileButton.disabled = false;
  }

  sendFile() {
    let fileToBeSent = this.file;
    this.reader.readAsArrayBuffer(fileToBeSent);
    this.fileType = fileToBeSent.type;
    // this.peer.send(fileToBeSent);
    // @ts-ignore
    // var dataView = new Uint8Array(fileBuffer);
    // this.peer.send(dataView);
    // this.peer.send(dataView);
    console.log(fileToBeSent.name, fileToBeSent.type);
    this.messages.push({
      data: "You sent a file",
      sender: "you",
      type: "file",
    })
  }

  doSomething(e){
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    this.connection.send(file);
  }
  
  doNothing(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ngOnInit() {
    this.connectButton = document.getElementById("connectButton");
    this.disconnectButton = document.getElementById("disconnectButton");
    this.sendButton = document.getElementById("sendButton");
    this.messageBox = document.getElementById("message");
    this.receiveBox = document.getElementById("receiveBox");
    this.fileBox = document.getElementById("fileBox");
    this.sendFileButton = document.getElementById("sendFileButton");
    
  }

  getBlob() {
    this.receiveFileName = this.receiveFileMetadata.fileName; 
    var dataBlob = new Blob(this.fileArray, {type: this.receiveFileMetadata.fileType});
    let url = window.URL.createObjectURL(dataBlob);
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // window.open(url);
    console.log(url);
    console.log(this.receiveFileName);
    this.ref.detectChanges();
    // TODO: revoke url
    // console.log(this.fileArray);
    this.fileArray = null;
    this.receiveFileMetadata = {};
    this.receivedChunkCounter = 0;
    this.maxFileChunks = null;
    this.fileProgress = null;
  }
  connectPeers(answer) {
    var self = this;
    this.signalClient.connect(this.peerId);
  }

  sendMessage(text) {
    this.peer.send(text);
  }

  getAnswer(offer) {
    this.peer.signal(JSON.parse(offer));
  }
}