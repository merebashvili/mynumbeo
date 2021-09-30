const express = require('express')
const router = express.Router()
const Country = require('../models/country')
const Product = require('../models/product')
const auth = require('../middleware/auth')
const { isValidOperation, updateManually } = require('../shared/shared')

// Get all countries along with their product ids
router.get('/countries', auth, async (req, res) => {
    try {
        Country.find({ owner: req.user._id }).populate('products').exec(function (err, country) {
            if (err) return handleError(err);
            if (!country) {
                return res.status(404).send()
            }
            res.send(country)
        })
    } catch (e) {
        res.status(500).send(e)
    }
})

// Get country data by country id along with its product ids
router.get('/countries/:id', auth, async (req, res) => {
    const owner = req.user._id
    const countryId = req.params.id

    try {
        // Here we link the existing products to the country's 'products' property according to their _ids
        Country.findOne({_id: countryId, owner}).populate('products').exec(function (err, country) {
            if (err) return handleError(err);
            if (!country) {
                return res.status(404).send()
            }
            res.send(country)
        })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/countries/:id', auth, async (req, res) => {
    const owner = req.user._id
    const _id = req.params.id

    if (!isValidOperation(req.body, ['name'])) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        let countryToBeUpdated = await Country.findOne({_id, owner})
        countryToBeUpdated = await updateManually(req.body, countryToBeUpdated)

        if (!countryToBeUpdated) {
            return res.status(404).send()
        }

        await countryToBeUpdated.save()

        res.send(countryToBeUpdated)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/countries/:id', auth, async (req, res) => {
    const owner = req.user._id
    const _id = req.params.id

    try {
        const countryToBeDeleted = await Country.findOneAndDelete({_id, owner})

        if (!countryToBeDeleted) {
            return res.status(404).send()
        }

        await Product.deleteMany({country: countryToBeDeleted._id, owner})

        res.send(countryToBeDeleted)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router