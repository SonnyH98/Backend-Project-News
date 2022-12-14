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

exports.selectArticles = async (queries) => {
  const validQueries = ['topic', 'order', 'sort_by'];
  for (key of Object.keys(queries)) {
    if (validQueries.indexOf(key) === -1) {
      return Promise.reject({ status: 400, msg: 'Invalid query!' });
    }
  }

  let sort_by = queries.sort_by;
  let order_by = queries.order;
  const topic = queries.topic;

  if (typeof sort_by === 'undefined') {
    sort_by = 'created_at';
  }
  if (typeof order_by === 'undefined') {
    order_by = 'DESC';
  }

  const validSortBys = [
    'article_id',
    'title',
    'topic',
    'author',
    'body',
    'created_at',
    'votes',
    'comment_count'
  ];
  const validOrderBys = ['ASC', 'asc', 'DESC', 'desc'];

  let insertQuery = `SELECT users.username AS author, articles.title,articles.article_id, articles.topic,articles.created_at, articles.votes,  COUNT(comments.article_id) AS comment_count FROM articles
  LEFT JOIN users on articles.author = users.username
  FULL JOIN comments ON articles.article_id = comments.article_id`;

  const injectArray = [];
  if (topic) {
    const { rows: topics } = await db.query(
      `SELECT * FROM topics WHERE slug = $1`,
      [topic]
    );
    if (topics.length === 0) {
      return Promise.reject({ status: 404, msg: 'Topic doesnt exist!' });
    }
    insertQuery += ` WHERE TOPIC = $1`;
    injectArray.push(topic);
  }

  insertQuery += ` GROUP BY users.username, articles.article_id
  ORDER BY ${sort_by} ${order_by}`;

  if (!validSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: 'Bad sort by request!' });
  } else if (!validOrderBys.includes(order_by)) {
    return Promise.reject({ status: 400, msg: 'Bad order by request!' });
  } else {
    const { rows: articles } = await db.query(insertQuery, injectArray);

    return articles;
  }
};

exports.selectCommentsByArticleId = async (id) => {
  const { rows: article } = await db.query(
    `SELECT * from articles WHERE article_id = $1;`,
    [id]
  );

  const { rows: comments } = await db.query(
    `SELECT comments.* FROM comments
    JOIN users on comments.author = users.username
    WHERE article_id = $1;`,
    [id]
  );

  if (article.length === 0) {
    return Promise.reject({ status: 404, msg: 'Article not found!' });
  }

  return comments;
};

exports.insertComment = async (body, username, article_id) => {
  const { rows: newComment } = await db.query(
    `INSERT into comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *;`,
    [body, username, article_id]
  );

  return newComment[0];
};
