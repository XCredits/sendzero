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
  messages: {text: string, sender: string}[];
  // Bind message with angular
  // message: string;
  
  connectButton = null;
  disconnectButton = null;
  sendButton = null;
  messageBox = null;
  receiveBox = null;

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
        console.log(data);
        let message = {
          "text": data,
          "sender": "peer"
        }
        self.messages.push(message);
        self.ref.detectChanges();
      });
    });
    
  }

  ngOnInit() {
    this.connectButton = document.getElementById("connectButton");
    this.disconnectButton = document.getElementById("disconnectButton");
    this.sendButton = document.getElementById("sendButton");
    this.messageBox = document.getElementById("message");
    this.receiveBox = document.getElementById("receiveBox");    
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
      let message = {
        "text": data,
        "sender": "peer"
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
      text: text,
      "sender": "you"
    }
    console.log(this);
    this.messages.push(message);
    this.connection.send(text);
  }
}