const { check, validationResult } = require('express-validator/check');
const MailingList = require('../models/mailing-list.model.js');
var Promise = require("bluebird");

module.exports = function (app) {
  app.post('/api/join-mailing-list', 
    viewRequest,
    //validateJoinMailingList,
    viewRequest, 
    joinMailingList, 
    viewRequest);
}

function viewRequest(req, res, next){
  console.log("Got in");
  next();
}

// /api/join-mailing-list
function validateJoinMailingList(){
  // This function returns an array of validation statements
  return [check('email').isEmail().withMessage('email not valid'), 
      // check('givenName').isLength({ min: 5 }),
      ];
}

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

