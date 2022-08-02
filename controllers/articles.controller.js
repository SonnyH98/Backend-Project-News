const topics = require('../db/data/development-data/topics.js');
const {
  selectArticleById,
  updateArticleById,
  selectArticles,
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
  selectArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};
