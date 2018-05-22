// const { check, validationResult } = require('express-validator/check');
var validator = require('validator');
const MailingList = require('../models/mailing-list.model.js');
const MailingListStats = require('../models/mailing-list-stats.model.js');
const statsService = require('../services/stats.service.js');
const Promise = require('bluebird');
const auth = require('../config/jwt-auth.js');

module.exports = function (app) {
  app.post('/api/join-mailing-list', joinMailingList);
}

// /api/join-mailing-list
// let validateJoinMailingList = [
//     check('email').isEmail().withMessage('email not valid'),
//     check('givenName').isString().withMessage('givenName not valid'),
//     check('familyName').isString().withMessage('familyName not valid'),
// ];

function joinMailingList(req, res) {
  // Validation
  if (typeof req.body.email !== 'string' ||
      !validator.isEmail(req.body.email) ||
      typeof req.body.givenName !== 'string' ||
      typeof req.body.givenName !== 'string' 
    ){
    return res.status(422).json({message: 'Request failed validation'});
  }

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //     return res.status(422).json({ errors: errors.mapped() });
  // }
  let mailingListUser = new MailingList();
  mailingListUser.email = req.body.email;
  mailingListUser.givenName = req.body.givenName;
  mailingListUser.familyName = req.body.familyName;
  return mailingListUser.save()
      .then((result) => {
        res.status(200).send({ message: 'Success' });
        return statsService.increment(MailingListStats);
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({ message: error.message });
      });
}

