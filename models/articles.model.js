const db = require('../db/connection');

exports.selectArticleById = async (id) => {
  const { rows: article } = await db.query(
    'SELECT * from articles WHERE article_id = $1',
    [id]
  );
  if (article.length === 0) {
    return Promise.reject({ status: 404, msg: 'Article not found!' });
  }
  return article;
};
