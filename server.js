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
const socialController = require('./server/controllers/social.controller');
const routes = require('./server/routes');

app.use(bodyParser.urlencoded({extended: true})); // extended gives full JSON
app.use(bodyParser.json());
app.use(cookieParser());


app.use('/', function(req, res, next) {
  let redirect = false;
  // Redirect non-https
  if (req.headers['x-forwarded-proto'] === 'http' && // if using http
      req.hostname !== 'localhost') { // & not a local install
    if (req.method === 'GET') { // if it is a GET request
      redirect = true;
    } else { // if it is a POST, DELETE etc
      // Throw an error
      return res.status(400)
          .send({message: 'Do not make API requests using http, use https'});
    }
  }
  // Remove www
  let strippedHostname = req.hostname;
  if (strippedHostname.startsWith('www.')) {
    strippedHostname = strippedHostname.slice(4);
  }
  if (redirect) {
    return res.redirect('https://' + strippedHostname + req.originalUrl);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

app.use(socialController);

routes(app);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('*', function(req, res) {
  res.status(404).json({message: 'Route not found.'});
});

const server = http.createServer(app);
const io = require('socket.io')(server);
const signalServer = require('simple-signal-server')(io); // eslint-disable-line

io.on('connection', (socket) => {
  socket.on('request declined', (request) => {
    io.sockets.connected[request.id].emit('request declined', request);
  });
});

server.listen(port, function() {
  console.log(`Running on localhost:${port}`);
});
