const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { testUserOneId, testUserOne, setupDatabase } = require('./db');

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
  await setupDatabase();
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
      email: testUserOne.email,
      password: testUserOne.password,
    })
    .expect(200);
});

test('Should NOT log in non-existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: testUserOne.email,
      password: 'Nonexistent144',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should NOT get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should NOT delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should update valid user fields', async () => {
  const testName = 'testName';
  const testMail = 'testEmail@test.ge';
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({ name: testName, email: testMail })
    .expect(200);

  const user = await User.findById(testUserOneId);
  expect(user.name).toBe(testName);
});

test('Should NOT update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
    .send({ name: 'testName', _id: 'ks32jf243lsfl34wje4f' })
    .expect(400);
});
