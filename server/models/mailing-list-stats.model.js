const mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var Schema = mongoose.Schema;

var MailingListStatsSchema = new Schema({
    time: {type: Date, required: true},
    count: {type: Number, default: 1},
  }
);

MailingListStatsSchema.index({ time: 1 });

module.exports = mongoose.model('MailingListStats', MailingListStatsSchema);