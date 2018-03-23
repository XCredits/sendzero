import { Component, OnInit } from '@angular/core';
//import { Peer } from '../app/peer.js';

// let mediaConstraints = {
//   audio: true,
//   video: true
// }

// let connection = null;
// let clientId = 0;
// let peerConnection = null;
// let hostName = window.location.hostname;

// function sendToServer(msg) {
//   let msgJSON = JSON.stringify(msg);

//   console.log("Sending message");
//   connection.send(msgJSON);
// }

// function connect() {
//   let serverUrl;
//   let scheme = "ws";

//   serverUrl = scheme + "://" + hostName + ":8080";

//   connection = new WebSocket(serverUrl, "json");

//   connection.onopen = function(event) {
//     // document.getElementById("messageBox").disabled = false;
//     // document.getElementById("sendButton").disabled = false;
//   };

//   connection.onmessage = function(event) {
//     console.log(JSON.parse(event.data));
//   }
// }

// function sendMessage() {
//   var msg = {
//     // text: document.getElementById("messageBox").value,
//     type: "message",
//     id: clientId,
//     date: Date.now()
//   };
// }


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

  connectPeers() {
    this.localConnection = new RTCPeerConnection(null);
   
    this.sendChannel = this.localConnection.createDataChannel("sendChannel");
    this.sendChannel.onopen = this.handleSendChannelStatusChange.bind(this);
    this.sendChannel.onclose = this.handleSendChannelStatusChange.bind(this);
    this.remoteConnection = new RTCPeerConnection(null);
    this.remoteConnection.ondatachannel =
        this.receiveChannelCallback.bind(this);
    
    this.localConnection.onicecandidate = e => !e.candidate
        || this.remoteConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError.bind(this));
  
    this.remoteConnection.onicecandidate = e => !e.candidate
        || this.remoteConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError.bind(this));
  
    this.localConnection.createOffer()
        .then(offer => this.localConnection.setLocalDescription(offer))
        .then(() => 
            this.remoteConnection
                .setRemoteDescription(this.localConnection.localDescription))
        .then(() => this.remoteConnection.createAnswer())
        .then((answer) => this.remoteConnection.setLocalDescription(answer))
        .then(() => 
            this.localConnection
                .setRemoteDescription(this.remoteConnection.localDescription))
        .catch(this.handleCreateDescriptionError.bind(this));  
  }
 
  handleSendChannelStatusChange(event) {
    if (this.sendChannel) {
      let state = this.sendChannel.readyState;
      if (state === "open") {
        this.messageBox.disabled = false;
        this.messageBox.focus();
        this.sendButton.disabled = false;
        this.disconnectButton.disabled = false;
        this.connectButton.disabled = true;
      } else {
        this.messageBox.disabled = true;
        this.sendButton.disabled = true;
        this.connectButton.disabled = false;
        this.disconnectButton.disabled = true;
      }
    }
  }

  receiveChannelCallback(event) {
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.handleReceiveMessage.bind(this);
    this.receiveChannel.onopen =
        this.handleReceiveChannelStatusChange.bind(this);
    this.receiveChannel.onclose =
        this.handleReceiveChannelStatusChange.bind(this);
  }

  handleReceiveMessage(event) {
    let elem = document.createElement("p");
    let textNode = document.createTextNode(event.data)
    
    elem.appendChild(textNode);
    this.receiveBox.appendChild(elem);
  }

  handleReceiveChannelStatusChange(event) {
    if (this.receiveChannel) {
      console.log("Receive channel's status was changed to " + 
                    this.receiveChannel.readyState);
    }
  }

  handleAddCandidateError() {
    console.log("addICECandidate failed!");
  }

  handleCreateDescriptionError(error) {
    console.log("Unable to create an offer: " + error.toString());
  }

  disconnectPeers() {

    this.sendChannel.close();
    this.receiveChannel.close();
    console.log(this.receiveChannel);

    this.localConnection.close();
    this.remoteConnection.close();

    this.sendChannel = null;
    this.receiveChannel = null;
    this.localConnection = null;
    this.remoteConnection = null;

    this.connectButton.disabled = false;
    this.disconnectButton.disabled = true;

    this.messageBox.value = "";
    this.messageBox.disabled = true;
  }

  sendMessage() {
    let message = this.messageBox.value;
    this.sendChannel.send(message);

    this.messageBox.value = "";
    this.messageBox.focus();
  }



}