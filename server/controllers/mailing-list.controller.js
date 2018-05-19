const { check, validationResult } = require('express-validator/check');
const MailingList = require('../models/mailing-list.model.js');
var Promise = require("bluebird");

module.exports = function (app) {
  app.post('/api/join-mailing-list', 
    viewRequest,
    validateJoinMailingList,
    viewRequest, 
    joinMailingList, 
    viewRequest);
}

function viewRequest(req, res, next){
  console.log("Got in");
  next();
}

// /api/join-mailing-list
let validateJoinMailingList = [
    check('email').isEmail().withMessage('email not valid'),
    check('givenName').isString().withMessage('givenName not valid'),
    check('familyName').isString().withMessage('familyName not valid'),
];

function joinMailingList(req, res) {
  console.log("Successfully called backend route");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
  }
  console.log('Passed validation');
  let mailingListUser = new MailingList();
  mailingListUser.email = req.body.email;
  mailingListUser.givenName = req.body.givenName;
  mailingListUser.familyName = req.body.familyName;
  console.log('Attempt to save');
  return mailingListUser.save()
      .then((result) => {
        console.log('Successful call');
        res.status(200).send({ message: "Success" });
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({ message: error.message });
      });
}

