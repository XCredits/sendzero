const { check, validationResult } = require('express-validator/check');
const MailingListStats = require('../models/mailing-list-stats.model.js');
const statsService = require('../services/stats.service.js');
const Promise = require('bluebird');
const auth = require('../config/jwt-auth.js');

const MailingList = require('../models/mailing-list.model.js');

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
  MailingListStats.find({})
      .then(results => {
        res.send(results);
      })
      .catch(err => {
        res.status(500)
            .send({message: 'Error retrieving data from stats database'});
      });
}
