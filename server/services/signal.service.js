const EventEmitter = require('events');

/**
 * placeholder
 */
class Signal extends EventEmitter {
  /**
   *
   * @param {*} io socket.io instance
   */
  constructor(io) {
    super();

    this._sockets = {};
    this.peers = [];

    io.on('connection', this._onConnect.bind(this));
  }

  /**
   *
   * @param {*} socket
   */
  _onConnect(socket) {
    let self = this;
    self._sockets[socket.id] = socket;

    socket.on('signal-disconnect', self._onDisconnect.bind(self, socket));
    socket.on('signal-discover', self._onDiscover.bind(self, socket));
    socket.on('signal-offer', self._onOffer.bind(self, socket));
    socket.on('signal-answer', self._onAnswer.bind(self, socket));
    // TODO: clean up into function
    socket.on('request declined', (request) => {
      request.declinedBy = socket.id;
      io.sockets.connected[request.id].emit('request declined', request);
    });

    // TODO: clean up?
    self.on('disconnect', (disconnectedSocket) => {
      socket.emit('peer disconnected', disconnectedSocket.id);
    });

    // self.emit('connect', socket);
  }

  /**
   *
   * @param {*} socket
   */
  _onDisconnect(socket) {
    let self = this;
    delete self._sockets[socket.id];

    self.emit('disconnect', socket);
  }

  /**
   *
   * @param {*} socket
   */
  _onDiscover(socket) {
    let self = this;

    socket.emit('signal-discover', {
      id: socket.id,
    });

    // self.emit('discover', {});

    self.peers.push(socket.id);
  }

  /**
   *
   * @param {*} socket
   * @param {*} data
   */
  _onOffer(socket, data) {
    let self = this;

    if (!self._sockets[data.target]) {
      // TODO: emit no such user found
    }

    self._sockets[data.target].emit('signal-offer', {
      id: socket.id,
      trackingNumber: data.trackingNumber,
      signal: data.signal,
    });

    // self.emit('request', {});
  }

  /**
   *
   * @param {*} socket
   * @param {*} data
   */
  _onAnswer(socket, data) {
    let self = this;

    if (!self._sockets[data.target]) {
      // TODO: emit no such user found?
    }

    self._sockets[data.target].emit('signal-answer', {
      id: socket.id,
      trackingNumber: data.trackingNumber,
      signal: data.signal,
    });
  }
}

module.exports = Signal;
