const express = require('express')
const router = express.Router()
const Country = require('../models/country')
const Product = require('../models/product')
const { isValidOperation } = require('../shared/shared')

// Get all countries along with their product ids
router.get('/countries', async (req, res) => {
    try {
        const countries = await Country.find({})
        res.send(countries)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Get country data by country id along with its product ids
router.get('/countries/:id', async (req, res) => {
    const countryId = req.params.id

    try {
        // Here we link the existing products to the country's 'products' property according to their _ids
        Country.findOne({_id: countryId}).populate('products').exec(function (err, country) {
            if (err) return handleError(err);
            if (!country) {
                return res.status(404).send()
            }
            res.send(country)
        })
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.patch('/countries/:id', async (req, res) => {
    const _id = req.params.id

    // TO DO
    // See if there is a shorter way to validate
    if (!isValidOperation(req.body, ['name'])) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        /* Without {returnOriginal: false}, countryToBeUpdated will give me the old (preupdated) country.
        Also, without {runValidators: true}, there will be no validation check */
        const countryToBeUpdated = await Country.findByIdAndUpdate(_id, req.body, {returnOriginal: false, runValidators: true})

        if (!countryToBeUpdated) {
            return res.status(400).send()
        }

        res.send(countryToBeUpdated)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/countries/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const countryToBeDeleted = await Country.findByIdAndDelete({_id})

        if (!countryToBeDeleted) {
            return res.status(400).send()
        }

        await Product.deleteMany({country: countryToBeDeleted._id})

        res.send(countryToBeDeleted)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router