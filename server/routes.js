module.exports = function(app) {
  app.post('/api/join-strings', function (req, res) {
    console.log(req.body);
    var joinedString = req.body.inputString1 + req.body.inputString2;
    res.json({joinedString: joinedString});
  });

  app.post('/api/join-mailing-list', 
      validateJoinMailingList, 
      joinMailingList);
};



