const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
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

test('Should create new product and country along with it', async () => {
  const testProductId = new mongoose.Types.ObjectId();
  const testCountryName = 'Ukraine';
  const testProduct = {
    _id: testProductId,
    product: 'Beans',
    price_in_local: 10,
    price_in_usd: 3,
    quantity_for_month: 3,
    country: testCountryName,
    owner: testUserOne._id,
  };

  await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send(testProduct)
    .expect(201);

  const newProduct = await Product.findById(testProduct._id);
  expect(newProduct).not.toBeNull();

  // making sure after new product is created by new country,
  // that new country is also being created (with the product id in it)
  const newCountry = await Country.findOne({ name: testCountryName });
  expect(newCountry).not.toBeNull();
  expect(newCountry.products[0]).toEqual(testProduct._id);
});

test('Should create new product with existing country', async () => {
  const testProductId = new mongoose.Types.ObjectId();
  const testCountryName = 'Georgia';
  const testProduct = {
    _id: testProductId,
    product: 'Beans',
    price_in_local: 10,
    price_in_usd: 3,
    quantity_for_month: 3,
    country: testCountryName,
    owner: testUserOne._id,
  };

  await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send(testProduct)
    .expect(201);

  const newProduct = await Product.findById(testProduct._id);
  expect(newProduct).not.toBeNull();

  // making sure after new product is created by existing country,
  // that existing country is updated (with the new product id in it)
  const existingCountry = await Country.findById(testCountryOne._id);
  expect(existingCountry).not.toBeNull();
  expect(existingCountry.products[1]).toEqual(testProduct._id);
});
