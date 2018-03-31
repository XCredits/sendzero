'use strict';
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3000';
app.set('port', port);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const server = http.createServer(app);

server.listen(port, function () {
  console.log(`Running on localhost:${port}`);
});