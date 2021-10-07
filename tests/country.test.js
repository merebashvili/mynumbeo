const request = require('supertest');
const app = require('../src/app');
const Country = require('../src/models/country');
const { setupDatabase } = require('./db');

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
  await setupDatabase();
});

test('', () => {});
