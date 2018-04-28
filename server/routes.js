const mailingListController = 
    require('./controllers/mailing-list.controller.js');
const authenticationController = 
    require('./controllers/authentication.controller.js');

module.exports = function(app) {
  mailingListController(app);
  authenticationController(app);
};



