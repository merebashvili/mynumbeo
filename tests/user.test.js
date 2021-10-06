const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const testUser = {
    name: 'exampleName',
    email: 'exampleName@example.com',
    password: 'blabla12bla'
}

// making sure that every test that runs, runs in the same environment,
// with the same test data in the database
beforeEach(async () => {
    //delete every user in the database
    await User.deleteMany()
    //start with one user for testing other endpoints like login
    await new User(testUser).save()
})

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Lasha',
        email: 'lasha@example.ge',
        password: 'blablabla2132'
    }).expect(201)
})

test('Should log in existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'exampleName@example.com',
        password: 'blabla12bla'
    }).expect(200)
})