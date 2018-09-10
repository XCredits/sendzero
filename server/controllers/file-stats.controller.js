// const auth = require('../config/jwt-auth.js');

const FileStats = require('../models/file-stats.model');

module.exports = function(app) {
  app.post('/api/set-file-stats', setFileStats);
  app.post('/api/get-file-stats', getFileStats);
  app.post('/api/update-file-stats', updateFileStats);
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
      typeof totalSize !== 'number') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  let fileStats = new FileStats();
  fileStats.machineId = machineId;
  fileStats.machineIp = machineIp;
  fileStats.totalSize = totalSize;
  fileStats.totalFiles = totalFiles;

  return fileStats.save()
      .then((result) => {
        return res.status(200).send({message: 'Success'});
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
  const machineId = req.body.machineId;
  // Validation
  // TODO: Check valid id, same ip maybe?
  if (typeof machineId !== 'string') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  return FileStats.findOne({machineId: machineId})
      .then((result) => {
        return res.json({
          totalFiles: result.totalFiles,
          totalSize: result.totalSize,
        });
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}
/**
 * update file stats for a machine
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function updateFileStats(req, res) {
  const machineId = req.body.machineId;
  const totalFiles = req.body.totalFiles;
  const totalSize = req.body.totalSize;

  // Validation
  // TODO: id should be valid, maybe ip should be same?
  if (typeof machineId !== 'string' ||
      typeof totalFiles !== 'number' ||
      typeof totalSize !== 'number') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  return FileStats.findOne({machineId: machineId})
      .then((fileStats) => {
        fileStats.totalFiles = totalFiles;
        fileStats.totalSize = totalSize;
        return fileStats.save();
      })
      .then((result) => {
        return res.status(200).json({message: 'Success'});
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}
