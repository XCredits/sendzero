'use strict';
require('dotenv').config();
require('./server/config');
require('./server/mongoose-start');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser());
app.use(cookieParser());

const routes = require('./server/routes');

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

routes(app);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('*', function(req, res) {
  res.status(404).json({message: "Route not found."});
});

const server = http.createServer(app);
const io = require('socket.io')(server);
var signalServer = require('simple-signal-server')(io);


io.on('connection', (socket) => { 
  
  socket.on('request declined', (request) => {
    io.sockets.connected[request.id].emit('request declined', request);
  });

})


server.listen(port, function () {
  console.log(`Running on localhost:${port}`);
});
