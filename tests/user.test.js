const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
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

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
  //delete every user in the database
  await User.deleteMany();
  //start with one user for testing other endpoints like login
  await new User(testUser).save();
});

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Lasha',
      email: 'lasha@example.ge',
      password: 'blablabla2132',
    })
    .expect(201);
});

test('Should log in existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: testUser.password,
    })
    .expect(200);
});

test('Should NOT log in non-existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: 'Nonexistent144',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should NOT get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should NOT delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});
