const topics = require('../db/data/development-data/topics.js');
const { selectArticleById } = require('../models/articles.model.js');

exports.getArticleById = (req, res, next) => {
  const id = req.params.article_id;
  console.log(id);
  selectArticleById(id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};
