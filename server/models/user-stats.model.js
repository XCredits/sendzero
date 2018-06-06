const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

let UserStatsSchema = new Schema({
    time: {type: Date, required: true},
    count: {type: Number, default: 1},
  }
);

UserStatsSchema.index({time: 1});

module.exports = mongoose.model('UserStats', UserStatsSchema);
