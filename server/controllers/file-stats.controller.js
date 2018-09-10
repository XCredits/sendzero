// const auth = require('../config/jwt-auth.js');

const FileStats = require('../models/file-stats.model');

module.exports = function(app) {
  app.post('/api/get-file-stats', getFileStats);
};

/**
 * get total number of files and size of data sent
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function getFileStats(req, res) {
  // let totalSize;
  // let fileCount;
  const machineId = req.body.machineId;
  // Validation
  if (typeof machineId !== 'string') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  return FileStats.find({machineId: machineId})
      .then((result) => {
        console.log(result);
      });
}
