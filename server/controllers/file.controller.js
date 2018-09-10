// const auth = require('../config/jwt-auth.js');

const File = require('../models/file.model.js');

module.exports = function(app) {
  app.post('/api/add-file', addFile);
};

/**
 * add file info to db
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function addFile(req, res) {
  const fileSize = req.body.fileSize;
  const fileId = req.body.fileId;
  const fileType = req.body.fileType;
  const ip = req.ip;
  // Validation
  // id should have set length?
  // TODO: no auth so don't accept all requests
  if (typeof fileSize !== 'number' || fileSize === 0 ||
      typeof fileId !== 'string' ||
      typeof fileType !== 'string') {
    return res.status(422).json({message: 'Request failed validation.'});
  }

  let file = new File();
  file.id = fileId;
  file.size = fileSize;
  file.type = fileType;
  file.senderIp = ip;
  return file.save()
      .then((result) => {
        return res.status(200).send({message: 'Success'});
      })
      .catch((error) => {
        console.log('Error');
        console.log(error.message);
        return res.status(500).json({message: error.message});
      });
}
