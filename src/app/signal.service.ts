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
  humanId: any;
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

  init(socket, humanId) {
    this.socket = socket;
    this.humanId = humanId;

    // Find your own socket id
    socket.on('connect', function() {
      socket.emit('signal-discover', {
        humanId,
      });
    });

    if (socket.connected) {
      socket.emit('signal-discover', {
        humanId,
      });
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

    if (self._requests[data.trackingId]) {
      if (self._peers[data.trackingId]) {
        self._peers[data.trackingId].signal(data.signal);
      } else {
        self._requests[data.trackingId].push(data.signal);
      }
      return;
    }

    self._requests[data.trackingId] = [data.signal];

    self.signal.next({
      event: 'request',
      request: {
        id: data.id,
        humanId: data.humanId,
        accept: function() {
          const opts = {
            initiator: false,
          };

          // @ts-ignore
          const peer = new SimplePeer(opts);

          peer.id = data.id;
          peer.humanId = data.humanId;
          self._peers[data.trackingId] = peer;
          self.signal.next({
            event: 'peer',
            peer
          });

          peer.on('signal', function(signal) {
            self.socket.emit('signal-answer', {
              signal: signal,
              trackingId: data.trackingId,
              target: data.id,
              humanId: self.humanId,
            });
          });

          self._requests[data.trackingId].forEach(request => {
            peer.signal(request);
          });

          self._requests[data.trackingId] = [];
        }
      }
    });
  }

  _onAnswer(data: any) {
    const self = this;

    const peer =  self._peers[data.trackingId];
    if (!peer) {
      return;
    }

    if (peer.id) {
      peer.id = data.id;
      peer.humanId = data.humanId;
    } else {
      peer.id = data.id;
      peer.humanId = data.humanId;
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

  connect(humanId: any) {
    const self = this;

    const opts = {
      initiator: true,
    };

    const trackingId = shortid.generate();

    // @ts-ignore
    const peer = new SimplePeer(opts);
    self._peers[trackingId] = peer;

    peer.on('signal', function(signal) {
      self.socket.emit('signal-offer', {
        signal: signal,
        trackingId: trackingId,
        target: parseInt(humanId, 10),
      });
    });
  }
}

