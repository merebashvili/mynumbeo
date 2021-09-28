const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const { isValidOperation, updateManually } = require('../shared/shared')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    const token = await user.generateAuthToken()

    try {
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    // This function is only going to run if the user is authenticated (auth middleware is doing the job),
    // which means we only need to send the response
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id

    if (!isValidOperation(req.body, ['name', 'email', 'password'])) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // Here instead of updating user simply by findByIdAndUpdate, I have to manually do the update,
        // because as findByIdAndUpdate performs a direct operation on the database, it bypasses middleware
        let userToBeUpdated = await User.findById(_id)
        userToBeUpdated = await updateManually(req.body, userToBeUpdated)

        if (!userToBeUpdated) {
            return res.status(404).send()
        }

        await userToBeUpdated.save()

        res.send(userToBeUpdated)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const userToBeDeleted = await User.findByIdAndDelete(_id)

        if (!userToBeDeleted) {
            return res.status(404).send()
        }

        res.send(userToBeDeleted)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router