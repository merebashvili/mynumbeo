const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');

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

const setupDatabase = async () => {
  //delete every user in the database
  await User.deleteMany();
  //start with one user for testing other endpoints like login
  await new User(testUser).save();
};

module.exports = {
  testUserId,
  testUser,
  setupDatabase,
};
