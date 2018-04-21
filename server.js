'use strict';
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const url = require('url');
const https = require('https');

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
const io = require('socket.io')(server);
var signalServer = require('simple-signal-server')(io);

server.listen(port, function () {
  console.log(`Running on localhost:${port}`);
});