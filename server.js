'use strict';
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const WebSocketServer = require('websocket').server;
const url = require('url');
const https = require('https');

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, function () {
  console.log(`Running on localhost:${port}`);
});