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
