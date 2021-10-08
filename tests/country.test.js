const request = require('supertest');
const app = require('../src/app');
const Country = require('../src/models/country');
const Product = require('../src/models/product');
const {
  testUserOne,
  testCountryOne,
  testProductOne,
  testProductTwo,
  testCountryTwo,
  setupDatabase,
} = require('./db');

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
  await setupDatabase();
});

test('Should get countries for user', async () => {
  const response = await request(app)
    .get('/countries')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
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
    .get(`/countries/${testCountryOne._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);

  const country = response.body;
  expect(country.products).toHaveLength(1);
  expect(country.products[0]._id).toBe(testProductOne._id.toString());
});

test("Should NOT get other user's country by id", async () => {
  await request(app)
    .get(`/countries/${testCountryTwo._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(404);

  // Assert that other user's countryTwo really exists and thus to make sure it's
  // just a problem of ownership
  const countryTwo = await Country.findById(testCountryTwo._id);
  expect(countryTwo).not.toBeNull();
});

test('Should update country by id', async () => {
  await request(app)
    .patch(`/countries/${testCountryOne._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({ name: 'Turkey' })
    .expect(200);

  // Assert that country's name is really changed to Turkey
  const updatedCountry = await Country.findById(testCountryOne._id);
  expect(updatedCountry.name).toBe('Turkey');
});

test("Should NOT update other user's country by id", async () => {
  await request(app)
    .patch(`/countries/${testCountryTwo._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({ name: 'Turkey' })
    .expect(400);

  //Instead of 404, we expect to receive 400 because in '../src/routers/country'
  //we perform updating manually, and that's what causes 400 error if invalid country
  //id is provided
});

test('Should delete country by id', async () => {
  await request(app)
    .delete(`/countries/${testCountryOne._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);

  const deletedCountry = await Country.findById(testCountryOne._id);
  expect(deletedCountry).toBeNull();

  // This is very important assertion!
  // if one's country is deleted, it's own products within that country
  // should also be deleted

  const productByDeletedCountry = await Product.findById(testProductOne);
  expect(productByDeletedCountry).toBeNull();
});

test("Should NOT delete other user's country", async () => {
  await request(app)
    .delete(`/country/${testCountryTwo._id}`)
    .send()
    .expect(404);
});
