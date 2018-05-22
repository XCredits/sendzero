const { check, validationResult } = require('express-validator/check');
const MailingListStats = require('../models/mailing-list-stats.model.js');
const statsService = require('../services/stats.service.js');
var Promise = require('bluebird');
const auth = require('../config/jwt-auth.js');

module.exports = function (app) {
  app.post('/api/admin/mailing-list-count', auth.jwt, auth.isAdmin, 
      mailingListCount);
  app.post('/api/admin/mailing-list-stats', auth.jwt, auth.isAdmin, 
      mailingListStatsReport);
}

// /api/admin/mailing-list-count
function mailingListCount(req, res) {
  return MailingList.count()
        .then(count => {
          res.send({ count: count });
        });
}



function mailingListStatsReport(req, res) {
  console.log('req.body');
  console.log(req.body);
  let maxStatsReturned = 1000;

  // if (!req.body.scale) {
    
  // } else {
  //   let generateScale = function ({scale, start, end}) {
  //     const standardReturn = 20;
  //     let stepSizeMs;
  //     switch (scale) {
  //       case 'seconds':
  //         stepSizeMs = 1000;
  //         break;
  //       case 'minutes':
  //         stepSizeMs = 1000 * 60;
  //         break;
  //       case 'hours':
  //         stepSizeMs = 1000 * 60 * 60;
  //         break;
  //       case 'days':
  //         stepSizeMs = 1000 * 60 * 60 * 24;
  //         break;
  //       case 'weeks':
  //         stepSizeMs = 1000 * 60 * 60 * 24 *7;
  //         break;
  //       default:
  //         break;
  //     }
  //     if (!start, !end) {
  //       // ceil date now
  //     }
  //     // Floor


  //   };


  //   req.body.scale
  //   MailingList.aggregate([
  //     {
  //       $project: {
  //         "timeSubscribe": {
  //           "$range" : [Date.now()-40*24*60*60*1000, Date.now(), 24*60*60*1000]
  //         }
  //       }
  //     }])
  //     .then(data => {
  //       console.log(data);
  //     });
  //     // count:sum(1)
  // }


  // "Rest stops": { $range: [ 0, "$distance", 25 ] }
}
