const app = require('../app');
const { TestWatcher } = require('jest');
const { defaults } = require('pg');
const request = require('supertest');
const seed = require('../db/seeds/seed');

const db = require('../db/connection');
const data = require('../db/data');

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});
describe('api/topics', () => {
  describe('GET - Successful responses', () => {
    test('status: 200 and responds with an array of topic objects with the properties slug and description', () => {
      expected = ['slug', 'description'];
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(3);
          //checks that every item in the array has the correct keys
          for (let i = 0; i < body.length; i++) {
            expect(Object.keys(body[i])).toEqual(expected);
          }
        });
    });
  });
});

describe('api/articles/:article_id', () => {
  describe('GET - Successful responses', () => {
    test('status: 200 and responds with an article object with the required properties', () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          const article = body.article;
          expect(article).toEqual(
            expect.objectContaining({
              article_id: 1,
              title: 'Living in the shadow of a great man',
              topic: 'mitch',
              author: 'butter_bridge',
              body: 'I find this existence challenging',
              created_at: '2020-07-09T20:11:00.000Z',
              votes: 100,
            })
          );
        });
    });
    test('Article contains a comment count property after model has been changed', () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          const article = body.article;
          expect(article).toEqual(
            expect.objectContaining({
              comment_count: expect.any(String),
            })
          );
        });
    });
    test('Comment count in article object responses with the correct number', () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body.article.comment_count).toBe('11');
        });
    });
  });
  describe('GET - Error responses', () => {
    test('status:400 if invalid id request (Bad request)', () => {
      return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request!');
        });
    });
    test('status:404 if valid id but non existent', () => {
      return request(app)
        .get('/api/articles/1000')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Article not found!');
        });
    });
  });
  describe('PATCH - Successful Responses', () => {
    test('should return status: 200 and respond with the updated article for positive votes increase', () => {
      const update = {
        inc_votes: '5',
      };
      const expected = {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: '2020-07-09T20:11:00.000Z',
        votes: 105,
      };
      return request(app)
        .patch('/api/articles/1')
        .send(update)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual(expected);
        });
    });
    test('should return status: 200 and respond with the updated article for negative votes increase', () => {
      const update = {
        inc_votes: '-5',
      };
      const expected = {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: '2020-07-09T20:11:00.000Z',
        votes: 95,
      };
      return request(app)
        .patch('/api/articles/1')
        .send(update)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual(expected);
        });
    });
  });
  describe('PATCH - Error Responses', () => {
    test('status:400 if invalid id request (Bad request)', () => {
      const update = {
        inc_votes: '5',
      };
      return request(app)
        .patch('/api/articles/banana')
        .send(update)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request!');
        });
    });
    test('status:400 for invalid votes input (Bad request)', () => {
      const update = {
        inc_votes: 'banana',
      };
      return request(app)
        .patch('/api/articles/1')
        .send(update)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request!');
        });
    });
    test('status:404 for valid article id but non-existent', () => {
      const update = {
        inc_votes: '5',
      };
      return request(app)
        .patch('/api/articles/1000')
        .send(update)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Article not found!');
        });
    });
  });
});

describe('api/users', () => {
  describe('GET - Successful Responses', () => {
    test('status: 200 and responds with an array of objects containing correct properties', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users).toHaveLength(4);
          for (let i = 0; i < users.length; i++) {
            expect(users[i]).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
              })
            );
          }
        });
    });
  });
});

describe('api/articles', () => {
  describe('GET - Successful Responses', () => {
    test('status: 200 and responds with an array of article objects with the required properties', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(12);
          //check the article contains correct properties
          articles.forEach((article) =>
            expect(article).toEqual(
              expect.objectContaining({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(String),
              })
            )
          );
        });
    });
    test('Articles array is sorted in descending order by date', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          console.log(articles);
          expect(articles).toBeSortedBy('created_at', { descending: true });
        });
    });
  });
});

describe('api/articles/:article_id/comments', () => {
  describe('GET - Successful Responses', () => {
    test('status: 200 and responds with an array of the comments for a given article with the required properties', () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(11);
          comments.forEach((article) =>
            expect(article).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                body: expect.any(String),
                article_id: expect.any(Number),
                author: expect.any(String),
                votes: expect.any(Number),
                created_at: expect.any(String),
              })
            )
          );
        });
    });
    test('status: 200 and responds with an empty array for valid articles with no comments', () => {
      return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(0);
        });
    });
    describe('GET - Error Responses', () => {
      test('status: 400 when given an invalid id', () => {
        return request(app)
          .get('/api/articles/banana/comments')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request!');
          });
      });
      test('status: 404 and article not found message', () => {
        return request(app)
          .get('/api/articles/100/comments')
          .expect(404)
          .then(({ body }) => {
            console.log(body);
            expect(body.msg).toBe('Article not found!');
          });
      });
    });
  });
});

describe('api/articles/:article_id/comments', () => {
  describe('POST- Successful Responses', () => {
    test('status:201 and endpoint responds with the added comment object', () => {
      const newComment = {
        username: 'butter_bridge',
        body: 'This is a test review!',
      };
      const expected = {
        comment_id: expect.any(Number),
        body: 'This is a test review!',
        article_id: 1,
        author: 'butter_bridge',
        votes: 0,
        created_at: expect.any(String),
      };
      return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(201)
        .then((res) => {
          const newComment = res.body.newComment;

          expect(newComment).toEqual(expected);
        });
    });
  });
  describe('POST- Error Responses', () => {
    test('status:400 for invalid article id', () => {
      const newComment = {
        username: 'butter_bridge',
        body: 'This is a test review!',
      };
      return request(app)
        .post('/api/articles/banana/comments')
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request!');
        });
    });
    test('status:400 for non-existent article-id due to foreign key violation', () => {
      const newComment = {
        username: 'butter_bridge',
        body: 'This is a test review!',
      };
      return request(app)
        .post('/api/articles/1000/comments')
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request!');
        });
    });
    test('status:400 for invalid newComment username input', () => {
      const newComment = {
        username: 5,
        body: 'This is a test review!',
      };
      return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad request!');
        });
    });
  });
});

describe('api/articles (queries)', () => {
  describe('GET - Successful Responses', () => {
    test('status:200 and default sorts the articles by date descending', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy('created_at', { descending: true });
        });
    });
    test('status:200 and sorts the articles by author when specified', () => {
      return request(app)
        .get('/api/articles?sort_by=author')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy('author', { descending: true });
        });
    });
    test('status:200 and sorts the articles in ascending order when specified', () => {
      return request(app)
        .get('/api/articles?sort_by=author&order=ASC')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy('author');
        });
    });
    test('status:200 and filters the articles by specified topic', () => {
      return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({ body: { articles } }) => {
          console.log(articles);
          expect(articles).toHaveLength(1);
          articles.forEach((article) =>
            expect(article).toEqual(
              expect.objectContaining({
                topic: 'cats',
              })
            )
          );
        });
    });
    test('status:200 and empty array for valid topic with no articles', () => {
      return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({ body: { articles } }) => {
          console.log(articles);
          expect(articles).toHaveLength(0);
          articles.forEach((article) =>
            expect(article).toEqual(
              expect.objectContaining({
                topic: 'paper',
              })
            )
          );
        });
    });
  });
  describe('GET - Error Responses', () => {
    test('status:400 if invalid sort by request (Bad request)', () => {
      return request(app)
        .get('/api/articles?sort_by=banana')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad sort by request!');
        });
    });
    test('status:400 if sort by query is spelt incorrectly (Bad request)', () => {
      return request(app)
        .get('/api/articles?sortby=author')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid query!');
        });
    });
    test('status:400 if invalid order by request (Bad request)', () => {
      return request(app)
        .get('/api/articles?sort_by=author&order=banana')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad order by request!');
        });
    });
    test('status:400 if order by query is spelt incorrectly (Bad request)', () => {
      return request(app)
        .get('/api/articles?orderby=ASC')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid query!');
        });
    });
    test('status:400 if topic query is spelt incorrectly (Bad request)', () => {
      return request(app)
        .get('/api/articles?topc=cats')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid query!');
        });
    });
    test('status:400 for more complex query involving one correct query and other misspelt ones)', () => {
      return request(app)
        .get('/api/articles?sort_by=author&grab_by=nothing&sortby=date')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid query!');
        });
    });
    test('status:404 for topics that dont exist)', () => {
      return request(app)
        .get('/api/articles?topic=banana')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Topic doesnt exist!');
        });
    });
  });
});
