declare var require: any
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { isObject, isString } from 'util';
import io from 'socket.io-client';
let io = require('socket.io-client');
let Peer = require('simple-peer');
let SimpleSignalClient = require('simple-signal-client');
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
  url: string = null;
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
  fileArray = [];  

  constructor(private ref: ChangeDetectorRef) {
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
        self.peer.send(JSON.stringify({a:'b'}));
        console.log('CONNECTED');
      })
      peer.on('data', function(data) {
        // @ts-ignore
        console.log(JSON.parse(new TextDecoder('utf-8').decode(data)));
        let message = {
          "data": "file",
          "sender": "peer",
          "type": "file",
        }
        console.log(data);
      //   self.fileArray = new Uint8Array(data);
      //   self.offset = data.length;
      // }
      //   var dataBlob = new Blob([data], {type: 'application/octet-stream'}); 
      //   message.data = url;
        // }
        self.fileArray.push(data);
        self.messages.push(message);
        self.ref.detectChanges();
      })
      peer.on('error', function (err) { console.log('error', err) })
    })
    this.messages = [];
    this.reader = new FileReader();
    this.reader.onload = function () {
      console.log('Finished reading the file');
      console.log(self.reader.readyState);
      let fileView = new Uint8Array(self.reader.result);
      console.log(fileView);
      // var dataBlob = new Blob([self.reader.result], {type: self.fileType});
      // self.peer.send(self.reader.result);
      self.peer.send(fileView);
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
    // var totalLength =  0;
    // var offset = this.fileArray[0].length;
    // this.fileArray.forEach(element => {
    //   totalLength = element.length;
    // });
    // var newFileArray = new Uint8Array(totalLength);
    // // make this dyanmic
    // // and delete stuff from array as soon as you put it into new array
    // newFileArray.set(this.fileArray[0]);
    // newFileArray.set(this.fileArray[1], offset);
    var dataBlob = new Blob(this.fileArray, {type: 'application/octet-stream'});
    var url = window.URL.createObjectURL(dataBlob);
    this.url = url;
    window.open(url);
    console.log(url);
    // TODO: revoke url
    console.log(this.fileArray);
    this.fileArray = [];
  }
  connectPeers(answer) {
    var self = this;
    // this.connection.on('open', function(){
    //   self.messageBox.disabled = false;
    //   self.sendButton.disabled = false;
    //   console.log('connection is open');
    // });
    // this.connection.on('data', function(data) {
    //   console.log(data.data);
    //   let message = {
    //     "data": data.data,
    //     "sender": "peer",
    //     "type": data.type,
    //   };
  //     var dataView = new Uint8Array(data.data);
  //     var dataBlob = new Blob([dataView]);
  //     message.data = url;
    //   self.messages.push(message);
    //   self.ref.detectChanges();
    // });
    // this.peer.signal(JSON.parse(answer));
    this.signalClient.connect(this.peerId);
  }

  sendMessage(text) {
    this.peer.send(text);
  }

  getAnswer(offer) {
    this.peer.signal(JSON.parse(offer));
  }
}