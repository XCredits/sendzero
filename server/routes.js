const mailingListController =
    require('./controllers/mailing-list.controller.js');
const authenticationController =
    require('./controllers/authentication.controller.js');
const statsController =
    require('./controllers/stats.controller.js');
const fileController =
    require('./controllers/file.controller.js');
const fileStatsController =
    require('./controllers/file-stats.controller.js');

module.exports = function(app) {
  mailingListController(app);
  authenticationController(app);
  statsController(app);
  fileController(app);
  fileStatsController(app);
};

