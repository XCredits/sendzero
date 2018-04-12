declare var require: any
import { Injectable } from '@angular/core';
import { OnInit, ChangeDetectorRef } from '@angular/core';
import { Socket } from 'net';

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
  id: String;
  prompt: String;
  enableConnectButton: Boolean;
  
  // Untyped definitions
  signalClient;

  constructor() {
    this.id = null;
    this.prompt = "Please wait...";
    this.enableConnectButton = false;
   }


  ngOnInit() {
    var self = this;
    
    // Set up socket
    this.socket = io(SERVER_URL);
    // Set up signal client
    this.signalClient = new SimpleSignalClient(this.socket)  
    // Set up signal client's handler functions
    this.signalClient.on('ready', this.handleSignalClientReadyState.bind(this))
  }

  handleSignalClientReadyState() {
    this.id = this.signalClient.id;
    this.prompt = "Ready to connect! Enter peer's id below!"
    this.enableConnectButton = true;
  }
}
