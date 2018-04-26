var MailingList = require('../controllers/mailing-list.controllers.js');

module.exports = {
  joinMailingList: function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    let mailingListUser = new MailingList();
    mailingListUser.email = req.body.email;
    mailingListUser.givenName = req.body.givenName;
    mailingListUser.familyName = req.body.familyName;
    return mailingListUser.save()
        .then(result => {
          res.status(200).send({ message: "Success" });
        })
        .catch(error => {
          return res.status(500).json({ message: error.message });
        });
  },
  validateJoinMailingList: [
    check('email')
        .isEmail().withMessage('email not valid'), 
    // check('name')
    //     .isLength({ min: 5 }), 
  ], 


}