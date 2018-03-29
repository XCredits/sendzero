import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string;
  peerId: string;
  peer;
  connection;
  messages: {data: string, sender: string, type: string}[];
  file: File = null;
  url: string = null;

  connectButton = null;
  disconnectButton = null;
  sendButton = null;
  messageBox = null;
  receiveBox = null;
  fileBox = null;
  sendFileButton = null;

  constructor(private ref: ChangeDetectorRef) {
    this.title = 'SendZero Alpha';
    // @ts-ignore
    this.peer = Peer({key: 'lwjd5qra8257b9'});
    var self = this;
    this.peer.on('open', function(id) {
      self.peerId = id;
      console.log('My Peer Id is:' + id);
    })
    this.messages = [];
    var self = this;
    this.peer.on('connection', function(conn) {
      self.messageBox.disabled = false;
      self.sendButton.disabled = false;
      self.connection = conn;
      conn.on('data', function(data){
        console.log(data.data);
        let message = {
          "data": data.data,
          "sender": "peer",
          "type": data.type,
        }
        if (data.type === "file") {
          var dataView = new Uint8Array(data.data);
          var dataBlob = new Blob([dataView], {type: "application/octet-stream"});
          var url = window.URL.createObjectURL(dataBlob);
          self.url = url;
          message.data = url;
        }
        self.messages.push(message);
        self.ref.detectChanges();
      });
    });
  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);
    this.sendFileButton.disabled = false;
  }

  sendFile() {
    let fileToBeSent = this.file;
    this.connection.send({
      data: fileToBeSent,
      type: "file"
    });
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

  connectPeers() {
    let peer_id = (<HTMLInputElement>document.getElementById("peer_id")).value;
    peer_id = peer_id.replace(/\s$/gi, "");
    this.connection = this.peer.connect(peer_id, {"reliable": true});
    console.log(this.connection);
    var myPeerId = this.peer.id;
    var self = this;
    this.connection.on('open', function(){
      self.messageBox.disabled = false;
      self.sendButton.disabled = false;
      console.log('connection is open');
    });
    this.connection.on('data', function(data) {
      console.log(data.data);
      let message = {
        "data": data.data,
        "sender": "peer",
        "type": data.type,
      };
      if (data.type === "file") {
        var dataView = new Uint8Array(data.data);
        var dataBlob = new Blob([dataView], {type: "application/octet-stream"});
        var url = window.URL.createObjectURL(dataBlob);
        self.url = url;
        message.data = url;
      }
      self.messages.push(message);
      self.ref.detectChanges();
    });
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
}