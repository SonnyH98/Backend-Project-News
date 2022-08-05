const { readJSON } = require('../models/api-info.model.js');

exports.sendJSON = (req, res, next) => {
  console.log('a');
  readJSON()
    .then((apiData) => {
      res.status(200).send(apiData);
    })
    .catch(next);
};
