const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Product = require('../src/models/product');
const Country = require('../src/models/country');

const testUserOneId = new mongoose.Types.ObjectId();
const testUserTwoId = new mongoose.Types.ObjectId();
const testUserOne = {
  _id: testUserOneId,
  name: 'exampleName',
  email: 'exampleName@example.com',
  password: 'blabla12bla',
  tokens: [
    {
      token: jwt.sign({ _id: testUserOneId }, process.env.JWT_SECRET),
    },
  ],
};

const testUserTwo = {
  _id: testUserTwoId,
  name: 'exampleNameTwo',
  email: 'exampleNameTwo@example.com',
  password: 'blabla12bfdsla',
  tokens: [
    {
      token: jwt.sign({ _id: testUserTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const testCountryOneId = new mongoose.Types.ObjectId();
const testCountryTwoId = new mongoose.Types.ObjectId();
const testProductOneId = new mongoose.Types.ObjectId();
const testProductTwoId = new mongoose.Types.ObjectId();
const testCountryOne = {
  _id: testCountryOneId,
  name: 'Georgia',
  products: [testProductOneId],
  owner: testUserOne._id,
};

const testCountryTwo = {
  _id: testCountryTwoId,
  name: 'Georgia',
  products: [testProductTwoId],
  owner: testUserTwo._id,
};

const testProductOne = {
  _id: testProductOneId,
  product: 'testProductOneName',
  price_in_local: 15,
  price_in_usd: 5,
  quantity_for_month: 2,
  country: testCountryOne._id,
  owner: testUserOne._id,
};

const testProductTwo = {
  _id: testProductTwoId,
  product: 'testProductTwoName',
  price_in_local: 20,
  price_in_usd: 8,
  quantity_for_month: 3,
  country: testCountryTwo._id,
  owner: testUserTwo._id,
};

const setupDatabase = async () => {
  //delete every user, product & country in the database
  await User.deleteMany();
  await Product.deleteMany();
  await Country.deleteMany();
  //start with one user, one task & one country for testing
  // other endpoints like login, getting task, getting country, etc.
  await new User(testUserOne).save();
  await new User(testUserTwo).save();
  await new Product(testProductOne).save();
  await new Product(testProductTwo).save();
  await new Country(testCountryOne).save();
  await new Country(testCountryTwo).save();
};

module.exports = {
  testUserOneId,
  testUserOne,
  testProductTwo,
  testCountryOne,
  testCountryTwo,
  testProductOne,
  setupDatabase,
};
