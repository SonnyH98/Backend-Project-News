const topics = require('../db/data/development-data/topics.js');
const {
  selectArticleById,
  updateArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
} = require('../models/articles.model.js');

exports.getArticleById = (req, res, next) => {
  const id = req.params.article_id;
  selectArticleById(id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const id = req.params.article_id;
  const newVotes = req.body.inc_votes;
  updateArticleById(id, newVotes)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const id = req.params.article_id;
  selectCommentsByArticleId(id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const article_id = req.params.article_id;
  const username = req.body.username;
  const body = req.body.body;
  insertComment(body, username, article_id)
    .then((newComment) => {
      res.status(201).send({ newComment });
    })
    .catch(next);
};
