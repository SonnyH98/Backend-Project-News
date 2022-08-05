const { removeComment } = require('../models/comments.model.js');

exports.deleteComment = (req, res, next) => {
  const commentId = req.params.comment_id;
  removeComment(commentId)
    .then((comment) => {
      res.status(204).send({ comment });
    })
    .catch(next);
};
