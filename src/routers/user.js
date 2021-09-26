const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { isValidOperation } = require('../shared/shared')

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
        const userToBeUpdated = await User.findByIdAndUpdate(_id, req.body, { returnOriginal: false, runValidators: true })

        if (!userToBeUpdated) {
            return res.status(404).send()
        }

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