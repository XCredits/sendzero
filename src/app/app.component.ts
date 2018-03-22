import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string;
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
  }

  ngOnInit() {
    this.connectButton = document.getElementById("connectButton");
    this.disconnectButton = document.getElementById("disconnectButton");
    this.sendButton = document.getElementById("sendButton");
    this.messageBox = document.getElementById("message");
    this.receiveBox = document.getElementById("receiveBox");    
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