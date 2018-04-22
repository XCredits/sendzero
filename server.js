'use strict';
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

app.get('/api/test', function(req, res) {
  res.json({message:"Hello from express"});
});

app.post('/api/join-strings', function (req, res) {
  console.log(req.body);
  var joinedString = req.body.inputString1 + req.body.inputString2;
  res.json({joinedString: joinedString});
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const server = http.createServer(app);

server.listen(port, function () {
  console.log(`Running on localhost:${port}`);
});