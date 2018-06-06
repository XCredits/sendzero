const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

let MailingListStatsSchema = new Schema({
    time: {type: Date, required: true},
    count: {type: Number, default: 1},
  }
);

MailingListStatsSchema.index({time: 1});

module.exports = mongoose.model('MailingListStats', MailingListStatsSchema);
