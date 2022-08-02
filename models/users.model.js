const db = require('../db/connection');

exports.selectUsers = async () => {
  const { rows: users } = await db.query('SELECT * FROM users');
  return users;
};
