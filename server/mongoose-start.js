const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.Promise = Promise;

module.exports = mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
      console.log('Mongoose connected');
    })
    .catch((err)=>{
      console.log('Error in establishing MongoDB');
      console.log(err);
    });
