const request = require('supertest');
const app = require('../src/app');
const Country = require('../src/models/country');
const { testUser, testCountry, testProduct, setupDatabase } = require('./db');

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
  await setupDatabase();
});

test('Should get countries for user', async () => {
  const response = await request(app)
    .get('/countries')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200);

  const countries = response.body;
  expect(countries).toHaveLength(1);
});

test('Should NOT get countries for unauthenticated user', async () => {
  await request(app).get('/countries').send().expect(401);
});

test('Should get country by id', async () => {
  const response = await request(app)
    .get(`/countries/${testCountry._id}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200);

  const country = response.body;
  expect(country.products).toHaveLength(1);
  expect(country.products[0]._id).toBe(testProduct._id.toString());
});
