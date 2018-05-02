var mongoose = require('mongoose');
var Promise = require("bluebird");

mongoose.connect(process.env.MONGODB_URI);

mongoose.Promise = Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;