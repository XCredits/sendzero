/* eslint-disable */
// -----------Front End Code Below-------------------------------------------

let mediaConstraints = {
  audio: true,
  video: true
}

let connection = null;
let clientId = 0;
let peerConnection = null;
let hostName = window.location.hostname;

function sendToServer(msg) {
  let msgJSON = JSON.stringify(msg);

  console.log("Sending message");
  connection.send(msgJSON);
}

function connect() {
  let serverUrl;
  let scheme = "ws";

  serverUrl = scheme + "://" + hostName + ":8080";

  connection = new WebSocket(serverUrl, "json");

  connection.onopen = function(event) {
    // document.getElementById("messageBox").disabled = false;
    // document.getElementById("sendButton").disabled = false;
  };

  connection.onmessage = function(event) {
    console.log(JSON.parse(event.data));
  }
}

function sendMessage() {
  var msg = {
    // text: document.getElementById("messageBox").value,
    type: "message",
    id: clientId,
    date: Date.now()
  };
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

  //----------------------Back End Code here-----------------------------

  var webRtcServer = http.createServer(function(req, res) {
    console.log((new Date()) + ' Received request for ' + request.url);
    res.writeHead(404);
    res.end();
  });
  
  webRtcServer.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
  })
  
  var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });
  
  function originIsAllowed(origin) {
    return true;
  }
  
  wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log("Requests from this origin is not allowed.");
      return;
    }
  
    var connection = request.accept("json", request.origin);
  
    connection.clientId = Date.now();
  
    var msg = {
      type: "id",
      id: connection.clientId
    };
  
    connection.sendUTF(JSON.stringify(msg));
  
    connection.on('message', function(message) {
      if (message.type == "utf8") {
        console.log("Received Message: " + message.utf8Data);
  
        var sendToClient = true;
        msg = JSON.parse(message.utf8Data);
        var connect = getConnectionForId(msg.id);
  
        if (msg.type === "message") {
          msg.name = connect.username;
          msg.text = msg.text.replace(/^\s*$/ig, "");
        }
      }
      
      if (sendToClient) {
        var msgString = JSON.stringify(msg);
        connection.sendUTF(msgString);
      }
    });
  
    connection.on('close', function(reason, description) {
      p2pConnection = null;
      console.log("Connection closed.");
    })
  })



