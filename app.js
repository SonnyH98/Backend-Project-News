const { getTopics } = require('./controllers/topics.controller');
const {
  getArticleById,
  patchArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
} = require('./controllers/articles.controller');

const { getUsers } = require('./controllers/users.controller');
const express = require('express');
const { deleteComment } = require('./controllers/comments.controller');
const { sendJSON } = require('./controllers/api-info.controller');

const app = express();
const cors = require('cors');
//commented this out for later use as will need it for post requests
app.use(express.json());
app.use(cors());

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleById);

app.patch('/api/articles/:article_id', patchArticleById);

app.get('/api/users', getUsers);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', postComment);

app.delete('/api/comments/:comment_id', deleteComment);

app.get('/api', sendJSON);
//Error handling
app.all('*', (req, res) => {
  res.status(404).send({ msg: 'Bad Path!' });
});

app.use((err, req, res, next) => {
  if (err.code === '22P02' || err.code === '23503') {
    res.status(400).send({ msg: 'Bad request!' });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
