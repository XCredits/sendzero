import { Component, OnInit } from '@angular/core';
//import { Peer } from '../app/peer.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string;
  peerId: string;
  peer;
  // Bind message with angular
  // message: string;
  localConnection = null;
  remoteConnection = null;
  sendChannel = null;
  receiveChannel = null;

  connectButton = null;
  disconnectButton = null;
  sendButton = null;
  messageBox = null;
  receiveBox = null;

  constructor() {
    this.title = 'SendZero Alpha';
    this.peer = Peer({key: 'lwjd5qra8257b9'});
    var self = this;
    this.peer.on('open', function(id) {
      self.peerId = id;
      console.log('My Peer Id is:' + id);
    })
    this.peer.on('connection', function(conn) {
      conn.on('data', function(data){
        // Will print 'hi!'
        console.log(data);
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

  connectPeersPartTwo() {
    console.log('heerrrr');
    let peer_id = document.getElementById("peer_id").value;
    peer_id = peer_id.replace(/\s$/gi, "");
    var conn = this.peer.connect(document.getElementById("peer_id").value);
    console.log(conn);
    conn.on('open', function(){
      conn.send('hi!');
      console.log('connection is open');
    });
  }
}