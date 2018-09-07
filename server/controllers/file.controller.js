const auth = require('../config/jwt-auth.js');

const File = require('../models/file.model.js');

module.exports = function(app) {
  app.post('/api/add-file', auth.jwt, addFile);
  app.post('/api/get-file-stats', auth.jwt, getFileStats);
};

/**
 * add file info to db
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addFile(req, res) {
  const fileName = req.body.fileName;
  const fileSize = req.body.fileSize;
  const fileId = req.body.fileId;
  const fileType = req.body.fileType;
  // Validation
  // id should have set length?
  if (typeof fileName !== 'string' ||
      typeof fileSize !== 'number' || size === 0 ||
      typeof fileId !== 'string' ||
      typeof fileType !== 'string') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  let file = new File();
  file.name = fileName;
  file.id = fileId;
  file.size = fileSize;
  file.type = fileType;

  return file.save()
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
  return File.aggregate([
        {$group: {_id: null, totalSize: {$sum: '$size'}}},
        {$project: {_id: 0, totalSize: 1}},
      ])
      .then((result) => {
        console.log(result);
        // totalSize = result.totalSize;
        return File.count();
      })
      .then((result) => {
        // fileCount = result.count;
        console.log(result);
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}
