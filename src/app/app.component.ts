declare var require: any
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { isObject, isString } from 'util';
// import Peer from 'simple-peer';
let Peer = require('simple-peer');



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string;
  peerId: string;
  peer;
  offer;
  connection;
  messages: {data: string, sender: string, type: string}[];
  file: File = null;
  url: string = null;
  fileType;
  
  connectButton = null;
  disconnectButton = null;
  sendButton = null;
  messageBox = null;
  receiveBox = null;
  fileBox = null;
  sendFileButton = null;
  reader;
  

  constructor(private ref: ChangeDetectorRef) {
    this.title = 'SendZero Alpha';
    // @ts-ignore
    this.peer = new Peer({ initiator: location.hash === '#1', trickle: false });
    var self = this;
    this.peer.on('open', function(id) {
      self.peerId = id;
      console.log('My Peer Id is:' + id);
    })
    this.messages = [];
    var self = this;
    this.peer.on('signal', function (data) {
      console.log('SIGNAL', JSON.stringify(data))
      self.offer = JSON.stringify(data);
      self.ref.detectChanges();
    })
    this.peer.on('connect', function() {
      self.messageBox.disabled = false;
      self.sendButton.disabled = false;
      console.log('CONNECTED');
      // console.log(data.data);
      // let message = {
      //   "data": data.data,
      //   "sender": "peer",
      //   "type": data.type,
      // }
      // if (data.type === "file") {
      //   var dataView = new Uint8Array(data.data);
      //   var dataBlob = new Blob([dataView], {type: "application/octet-stream"});
      //   var url = window.URL.createObjectURL(dataBlob);
      //   self.url = url;
      //   message.data = url;
      // }
      // self.messages.push(message);
      // self.ref.detectChanges();
    });
    this.peer.on('data', function (data) {
      console.log('DATA RECEIVED: ');
      console.log(JSON.stringify(data))
      // data = JSON.stringify(JSON.parse(data));
      let message = {
        "data": data,
        "sender": "peer",
        "type": "file",
      }
      if (message.type === "file") {     
        var dataBlob = new Blob([data], {type: 'application/octet-stream'}); 
        var url = window.URL.createObjectURL(dataBlob);
        self.url = url;
        message.data = url;
        console.log(url);
      }
      self.messages.push(message);
      self.ref.detectChanges();
    });
    this.peer.on('error', function (err) { console.log('error', err) })
    this.reader = new FileReader();
    this.reader.onload = function () {
      console.log('Finished reading the file');
      console.log(self.reader.readyState);
      console.log(self.reader.result);
      // var dataBlob = new Blob([self.reader.result], {type: self.fileType});
      self.peer.send(self.reader.result);
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
    //@ts-ignore
    // var dataView = new Uint8Array(fileToBeSent);
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
    //   if (data.type === "file") {
    //     var dataView = new Uint8Array(data.data);
    //     var dataBlob = new Blob([dataView]);
    //     var url = window.URL.createObjectURL(dataBlob);
    //     self.url = url;
    //     message.data = url;
    //   }
    //   self.messages.push(message);
    //   self.ref.detectChanges();
    // });
    this.peer.signal(JSON.parse(answer));
  }

  sendMessage(text) {
    if (this.peer.disconnected) {
      alert('Not connected to peer!')
      return;
    }
    let message = {
      "data": text,
      "sender": "you",
      "type": "text",
    }
    this.messages.push(message);
    this.connection.send({
      data: text,
      type: "text"
    });
  }

  getAnswer(offer) {
    this.peer.signal(JSON.parse(offer));
  }
}