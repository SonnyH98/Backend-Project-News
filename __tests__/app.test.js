const app = require('../app');
const { TestWatcher } = require('jest');
const { defaults } = require('pg');
const request = require('supertest');
//import in seed

const db = require('../db/connection');
const data = require('../db/data');

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
              title: 'Running a Node App',
              topic: 'coding',
              author: 'jessjelly',
              body: 'This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.',
              created_at: '2020-11-07T06:03:00.000Z',
              votes: 0,
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
});
