const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

let FileStatsSchema = new Schema({
     totalFiles: {type: Number},
     totalSize: {type: Number},
     machineId: {type: Number},
  }
);

module.exports = mongoose.model('FileStats', FileStatsSchema);
