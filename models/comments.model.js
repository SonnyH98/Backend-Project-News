const db = require('../db/connection');

exports.removeComment = async (commentId) => {
  const insertQuery = `DELETE FROM comments WHERE comment_id = $1 RETURNING *`;
  const res = await db.query(insertQuery, [commentId]);
  if (res.rowCount === 0) {
    return Promise.reject({
      status: 404,
      msg: 'Comment not found!',
    });
  }

  const comment = res.rows;
  return comment;
};
