'use strict';
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const WebSocketServer = require('websocket').server;
const url = require('url');
const https = require('https');
var ExpressPeerServer = require('peer').ExpressPeerServer;

var p2pConnection;
var options = {
  debug: true
}

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
app.use('/api', ExpressPeerServer(server, options));

server.listen(port, function () {
  console.log(`Running on localhost:${port}`);
});

  // server.on('connect', function(id) {

  // })

// var webRtcServer = http.createServer(function(req, res) {
//   console.log((new Date()) + ' Received request for ' + request.url);
//   res.writeHead(404);
//   res.end();
// });

// webRtcServer.listen(8080, function() {
//   console.log((new Date()) + ' Server is listening on port 8080');
// })

// var wsServer = new WebSocketServer({
//   httpServer: server,
//   autoAcceptConnections: false
// });

// function originIsAllowed(origin) {
//   return true;
// }

// wsServer.on('request', function(request) {
//   if (!originIsAllowed(request.origin)) {
//     request.reject();
//     console.log("Requests from this origin is not allowed.");
//     return;
//   }

//   var connection = request.accept("json", request.origin);

//   connection.clientId = Date.now();

//   var msg = {
//     type: "id",
//     id: connection.clientId
//   };

//   connection.sendUTF(JSON.stringify(msg));

//   connection.on('message', function(message) {
//     if (message.type == "utf8") {
//       console.log("Received Message: " + message.utf8Data);

//       var sendToClient = true;
//       msg = JSON.parse(message.utf8Data);
//       var connect = getConnectionForId(msg.id);

//       if (msg.type === "message") {
//         msg.name = connect.username;
//         msg.text = msg.text.replace(/^\s*$/ig, "");
//       }
//     }
    
//     if (sendToClient) {
//       var msgString = JSON.stringify(msg);
//       connection.sendUTF(msgString);
//     }
//   });

//   connection.on('close', function(reason, description) {
//     p2pConnection = null;
//     console.log("Connection closed.");
//   })
// })