
// const statsService = require('../services/stats.service.js');
// const Promise = require('bluebird');
const auth = require('../config/jwt-auth.js');

const MailingList = require('../models/mailing-list.model.js');
const MailingListStats = require('../models/mailing-list-stats.model.js');
const User = require('../models/user.model.js');
const UserStats = require('../models/user-stats.model.js');


module.exports = function(app) {
  app.post('/api/admin/mailing-list-count', auth.jwt, auth.isAdmin,
      mailingListCount);
  app.post('/api/admin/mailing-list-stats', auth.jwt, auth.isAdmin,
      mailingListStatsReport);
  app.post('/api/admin/user-register-count', auth.jwt, auth.isAdmin,
      userRegisterCount);
  app.post('/api/admin/user-register-stats', auth.jwt, auth.isAdmin,
      userRegisterStatsReport);
};


/**
 * /api/admin/mailing-list-count
 * @param {*} req request object
 * @param {*} res reponse object
 * @return {*}
 */
function mailingListCount(req, res) {
  // Validation
  // ...

  return MailingList.count()
        .then((count) => {
          res.send({count: count});
        });
};


/**
 * /api/admin/user-register-stats
 * @param {*} req request object
 * @param {*} res reponse object
 */
function mailingListStatsReport(req, res) {
  // Validation
  // not necessary as not using req.body

  MailingListStats.find({}, {time: 1, count: 1})
      .then((results) => {
        const resultsFiltered = results.map((x) => {
            return {time: x.time.getTime(), value: x.count};
        });
        res.send(resultsFiltered);
      })
      .catch((err) => {
        res.status(500)
            .send({message: 'Error retrieving data from stats database'});
      });
}


/**
 * /api/admin/user-register-count
 * @param {*} req request object
 * @param {*} res reponse object
 * @return {*}
 */
function userRegisterCount(req, res) {
  // Validation
  // not necessary as not using req.body

  return User.count()
        .then((count) => {
          res.send({count: count});
        });
}


/**
 * /api/admin/user-register-stats-report
 * @param {*} req request object
 * @param {*} res reponse object
 */
function userRegisterStatsReport(req, res) {
  // Validation
  // not necessary as not using req.body

  UserStats.find({}, {time: 1, count: 1})
      .then((results) => {
        const resultsFiltered = results.map((x) => {
            return {time: x.time.getTime(), value: x.count};
        });
        res.send(resultsFiltered);
      })
      .catch((err) => {
        res.status(500)
            .send({message: 'Error retrieving data from stats database'});
      });
}
