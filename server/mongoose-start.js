var mongoose = require('mongoose');
var Promise = require("bluebird");

mongoose.connect(process.env.MONGODB_URI);

console.log("mongoose.connection");
console.log(mongoose.connection);

mongoose.Promise = Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;