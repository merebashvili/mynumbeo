const request = require('supertest');
const app = require('../src/app');
const Country = require('../src/models/country');
const { testUser, testUserId, setupDatabase } = require('./db');

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
  await setupDatabase();
});

test('Should get countries for user', async () => {
  await request(app)
    .get('/countries')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should NOT get countries for unauthenticated user', async () => {
  await request(app).get('/countries').send().expect(401);
});
