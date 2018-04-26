var MailingList = require('../controllers/mailing-list.controllers.js');

module.exports = {
  joinMailingList: function(req, res) {
    
  },
  joinMailingListValidation: [
    check('email')
        .isEmail().withMessage('email not valid'), 
    // check('name')
    //     ..isLength({ min: 5 }), 
  ], 


}