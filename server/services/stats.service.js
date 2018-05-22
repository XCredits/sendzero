exports.increment = function (dbModel) {
  // Floor it to the current hour
  let time = new Date(Math.floor( Date.now() / (60*60*1000)) * (60*60*1000));
  return dbModel.update({time: time},
        {$inc: {count: 1}})
      .then(result => {
        // No saved element, starting from scratch
        if (result.nModified === 0) {
          var statElement = new dbModel();
          statElement.time = time;
          return statElement.save();
        }
        return null;
      });
}