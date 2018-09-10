// const auth = require('../config/jwt-auth.js');

const FileStats = require('../models/file-stats.model');

module.exports = function(app) {
  app.post('/api/set-file-stats', setFileStats);
  app.post('/api/get-file-stats', getFileStats);
};

/**
 * sets the file stats for a machine
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function setFileStats(req, res) {
  const machineId = req.body.machineId;
  const totalFiles = req.body.totalFiles;
  const totalSize = req.body.totalSize;
  const machineIp = req.ip;

  // Validation
  // TODO: id should have set length
  if (typeof machineId !== 'string' ||
      typeof totalFiles !== 'number' ||
      typeof totalSize !== 'string') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  let fileStats = new FileStats();
  fileStats.machineId = machineId;
  fileStats.machineIp = machineIp;
  fileStats.totalSize = totalSize;
  fileStats.totalFiles = totalFiles;

  return fileStats.save()
      .then((result) => {
        res.status(200).send({message: 'Success'});
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}

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
