const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Product = require('../src/models/product');
const Country = require('../src/models/country');

const testUserId = new mongoose.Types.ObjectId();
const testUser = {
  _id: testUserId,
  name: 'exampleName',
  email: 'exampleName@example.com',
  password: 'blabla12bla',
  tokens: [
    {
      token: jwt.sign({ _id: testUserId }, process.env.JWT_SECRET),
    },
  ],
};

const testCountryId = new mongoose.Types.ObjectId();
const testProductId = new mongoose.Types.ObjectId();
const testCountry = {
  _id: testCountryId,
  name: 'Georgia',
  products: [testProductId],
  owner: testUser._id,
};

const testProduct = {
  _id: new mongoose.Types.ObjectId(),
  product: 'testProductName',
  price_in_local: 15,
  price_in_usd: 5,
  quantity_for_month: 2,
  country: testCountry._id,
  owner: testUser._id,
};

const setupDatabase = async () => {
  //delete every user, product & country in the database
  await User.deleteMany();
  await Product.deleteMany();
  await Country.deleteMany();
  //start with one user, one task & one country for testing
  // other endpoints like login, getting task, getting country, etc.
  await new User(testUser).save();
  await new Product(testProduct).save();
  await new Country(testCountry).save();
};

module.exports = {
  testUserId,
  testUser,
  setupDatabase,
};
