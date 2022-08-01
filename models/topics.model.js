const db = require('../db/connection');

exports.selectTopics = async () => {
  const { rows: topics } = await db.query('Select * from topics');
  return topics;
};
