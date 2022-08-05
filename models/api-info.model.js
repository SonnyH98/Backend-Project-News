const db = require('../db/connection');
const fs = require('fs/promises');

exports.readJSON = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`).then((data) => {
    return JSON.parse(data);
  });
};
