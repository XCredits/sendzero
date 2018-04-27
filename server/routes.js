module.exports = function(app) {
  app.post('/api/join-mailing-list', 
      validateJoinMailingList, 
      joinMailingList);
};



