const db = require('../db/connection');

exports.selectArticleById = async (id) => {
  const { rows: article } = await db.query(
    `SELECT articles.*, COUNT(comments.article_id) AS comment_count  FROM articles 
    JOIN comments ON articles.article_id = comments.article_id 
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
    [id]
  );
  if (article.length === 0) {
    return Promise.reject({ status: 404, msg: 'Article not found!' });
  }
  return article;
};

exports.updateArticleById = async (id, newVotes) => {
  const { rows: updatedArticle } = await db.query(
    'UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;',
    [id, newVotes]
  );
  if (updatedArticle.length === 0) {
    return Promise.reject({ status: 404, msg: 'Article not found!' });
  }
  return updatedArticle;
};

exports.selectArticles = async () => {
  const { rows: articles } = await db.query(
    `SELECT users.username AS author, articles.title,articles.article_id, articles.topic,articles.created_at, articles.votes,  COUNT(comments.article_id) AS comment_count FROM articles
    LEFT JOIN users on articles.author = users.username
    FULL JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY users.username, articles.article_id
    ORDER BY created_at DESC`
  );

  return articles;
};
