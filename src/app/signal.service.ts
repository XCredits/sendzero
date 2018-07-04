declare var require: any;
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { findKey as _findKey } from 'lodash';

const shortid = require('shortid');

@Injectable()
export class SignalService {

  _peers: any;
  _requests: any;
  id: any;
  socket: any;
  signal: BehaviorSubject<any>;

  /**
   */
  constructor() {
    this._peers = {};
    this._requests = {};
    this.id = null;
    this.signal = new BehaviorSubject(null);
  }

  init(socket) {
    this.socket = socket;

    // Find your own socket id
    socket.on('connect', function() {
      socket.emit('signal-discover');
    });

    if (socket.connected) {
      socket.emit('signal-discover');
    }

    this.socket.on('signal-discover', this._onDiscover.bind(this));
    this.socket.on('signal-offer', this._onOffer.bind(this));
    this.socket.on('signal-answer', this._onAnswer.bind(this));
    this.socket.on('request declined', this._onDeclinedRequest.bind(this));
    this.socket.on('peer disconnected', this._onPeerDisconnect.bind(this));
  }

  _onDiscover(data: any) {
    this.id = data.id;
    this.signal.next({
      event: 'ready'
    });
  }

  _onOffer(data: any) {
    const self = this;

    if (self._requests[data.trackingNumber]) {
      if (self._peers[data.trackingNumber]) {
        self._peers[data.trackingNumber].signal(data.signal);
      } else {
        self._requests[data.trackingNumber].push(data.signal);
      }
      return;
    }

    self._requests[data.trackingNumber] = [data.signal];

    self.signal.next({
      event: 'request',
      request: {
        id: data.id,
        accept: function() {
          const opts = {
            initiator: false,
          };

          // @ts-ignore
          const peer = new SimplePeer(opts);

          peer.id = data.id;
          self._peers[data.trackingNumber] = peer;
          self.signal.next({
            event: 'peer',
            peer
          });

          peer.on('signal', function(signal) {
            self.socket.emit('signal-answer', {
              signal: signal,
              trackingNumber: data.trackingNumber,
              target: data.id,
            });
          });

          self._requests[data.trackingNumber].forEach(request => {
            peer.signal(request);
          });

          self._requests[data.trackingNumber] = [];
        }
      }
    });
  }

  _onAnswer(data: any) {
    const self = this;

    const peer =  self._peers[data.trackingNumber];
    if (!peer) {
      return;
    }

    if (peer.id) {
      peer.id = data.id;
    } else {
      peer.id = data.id;
      self.signal.next({
        event: 'peer',
        peer
      });
    }

    peer.signal(data.signal);
  }

  _onDeclinedRequest(request: any) {
    const self = this;
    if (request.id === this.id) {
      self.signal.next({
        event: 'request declined',
        declinedBy: request.declinedBy,
      });
    }
  }

  _onPeerDisconnect(peerId: string) {
    const self = this;
    console.log(peerId);
    let key;
    if (key = _findKey(this._peers, (v) => v.id === peerId)) {
      delete self._peers[key];
      self.signal.next({
        event: 'peer disconnected',
        disconnectedPeer: peerId,
      });
    }
  }

  connect(id: any) {
    const self = this;

    const opts = {
      initiator: true,
    };

    const trackingNumber = shortid.generate();

    // @ts-ignore
    const peer = new SimplePeer(opts);
    self._peers[trackingNumber] = peer;

    peer.on('signal', function(signal) {
      self.socket.emit('signal-offer', {
        signal: signal,
        trackingNumber: trackingNumber,
        target: id,
      });
    });
  }
}

