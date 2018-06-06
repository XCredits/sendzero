const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.connect(process.env.MONGODB_URI);

mongoose.Promise = Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
