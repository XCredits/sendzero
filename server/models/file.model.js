const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

let FileSchema = new Schema({
     name: {type: String},
     size: {type: Number},
     id: {type: String},
     type: {type: String},
  }
);

module.exports = mongoose.model('File', FileSchema);
