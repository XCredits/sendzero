const mailingListController = require('./controllers/mailing-list.controller.js');

module.exports = function(app) {
  mailingListController(app);
  
};



