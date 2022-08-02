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
          console.log(body);
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
