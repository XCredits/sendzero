const { check, validationResult } = require('express-validator/check');
const MailingList = require('../models/mailing-list.model.js');
const MailingListStats = require('../models/mailing-list-stats.model.js');
var Promise = require('bluebird');
const auth = require('../config/jwt-auth.js');

module.exports = function (app) {
  app.post('/api/join-mailing-list', validateJoinMailingList, joinMailingList);
  app.post('/api/admin/mailing-list-count', auth.jwt, auth.isAdmin, 
      mailingListCount);
  app.post('/api/admin/mailing-list-stats', auth.jwt, auth.isAdmin, 
      mailingListStatsReport);
}

// /api/join-mailing-list
let validateJoinMailingList = [
    check('email').isEmail().withMessage('email not valid'),
    check('givenName').isString().withMessage('givenName not valid'),
    check('familyName').isString().withMessage('familyName not valid'),
];

function joinMailingList(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
  }
  let mailingListUser = new MailingList();
  mailingListUser.email = req.body.email;
  mailingListUser.givenName = req.body.givenName;
  mailingListUser.familyName = req.body.familyName;
  return mailingListUser.save()
      .then((result) => {
        res.status(200).send({ message: 'Success' });
        // Floor it to the current hour
        let time = new Date(Math.floor( Date.now() / (60*1000)) * (60*1000));
        return MailingListStats.update({time: time},
              {$inc: {count: 1}})
            .then(result => {
              // No saved element, starting from scratch
              if (result.nModified === 0) {
                var statElement = new MailingListStats();
                statElement.time = time;
                return statElement.save();
              }
              return null;
            });
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({ message: error.message });
      });
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
