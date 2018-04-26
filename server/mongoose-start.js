var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;