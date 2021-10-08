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

test("Should get user's own product list", async () => {
  const response = await request(app)
    .get('/products/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);

  const products = response.body;
  expect(products[0]._id).toEqual(testProductOne._id.toString());
});

test('Should NOT get product list while unauthorized', async () => {
  await request(app).get('/products/me').send().expect(401);
});

test('Should update product by id', async () => {
  await request(app)
    .patch(`/products/${testProductOne._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({ price_in_local: 45, quantity_for_month: 10 })
    .expect(200);

  // Assert that products's properties is really changed
  const updatedProduct = await Product.findById(testProductOne._id);
  expect(updatedProduct.price_in_local).toBe(45);
});

test("Should NOT update other user's product by id", async () => {
  await request(app)
    .patch(`/countries/${testProductTwo._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({ price_in_local: 45 })
    .expect(400);

  //Instead of 404, we expect to receive 400 because in '../src/routers/product'
  //we perform updating manually, and that's what causes 400 error if invalid product
  //id is provided
});

test('Should delete product by id', async () => {
  await request(app)
    .delete(`/products/${testProductOne._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);

  const deletedProduct = await Product.findById(testProductOne._id);
  expect(deletedProduct).toBeNull();

  // This is very important assertion!
  // if one's product is deleted, this product's id within that country
  // should also be deleted from list of products

  const deletedProductCountry = await Country.findById(testCountryOne);
  expect(deletedProductCountry.products).toHaveLength(0);
});

test("Should NOT delete other user's product", async () => {
  await request(app)
    .delete(`/products/${testProductTwo._id}`)
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(404);
});
