const validator = require('validator');
const MailingList = require('../models/mailing-list.model.js');
const MailingListStats = require('../models/mailing-list-stats.model.js');
const statsService = require('../services/stats.service.js');
// const Promise = require('bluebird');
// const auth = require('../config/jwt-auth.js');

module.exports = function(app) {
  app.post('/api/join-mailing-list', joinMailingList);
};

/**
 * join a mailing list
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function joinMailingList(req, res) {
  let email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  // Validation
  if (typeof email !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      !validator.isEmail(email)
    ) {
    return res.status(422).json({message: 'Request failed validation'});
  }

  let mailingListUser = new MailingList();
  mailingListUser.email = email;
  mailingListUser.givenName = givenName;
  mailingListUser.familyName = familyName;
  return mailingListUser.save()
      .then((result) => {
        res.status(200).send({message: 'Success'});
        return statsService.increment(MailingListStats);
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}

