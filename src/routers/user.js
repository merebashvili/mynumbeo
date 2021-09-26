const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { isValidOperation, updateManually } = require('../shared/shared')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send({user})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
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