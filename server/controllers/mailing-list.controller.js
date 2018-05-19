const { check, validationResult } = require('express-validator/check');
const MailingList = require('../models/mailing-list.model.js');
var Promise = require('bluebird');
const auth = require('../config/jwt-auth.js');

module.exports = function (app) {
  app.post('/api/join-mailing-list', validateJoinMailingList, joinMailingList);
  app.get('/api/admin/mailing-list-count', auth.jwt, auth.isAdmin, 
      mailingListCount);
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
