const express = require('express')
const router = express.Router()
const Country = require('../models/country')

// Get all countries along with their product ids
router.get('/countries', async (req, res) => {
    try {
        const countries = await Country.find({})
        res.send(countries)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Get country data by country name along with its product ids
router.get('/countries/:country', async (req, res) => {
    const countryName = req.params.country

    try {
        // Here we link the existing products to the country's 'products' property according to their _ids
        Country.findOne({name: countryName}).populate('products').exec(function (err, country) {
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
    if (!isValidOperation(req.body)) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        /* Without {returnOriginal: false}, productToBeUpdated will give me the old (preupdated) product.
        Also, without {runValidators: true}, there will be no validation check,
        e.g. I can set "quantity_for_month" to 0, even though I have set the
        minimum quantity to 1 in product schema (./models/product) */
        const countryToBeUpdated = await Country.findByIdAndUpdate(_id, req.body, {returnOriginal: false, runValidators: true})

        if (!countryToBeUpdated) {
            return res.status(400).send()
        }

        res.send(countryToBeUpdated)
    } catch (e) {
        res.status(500).send(e)
    }
})

/* Checks if the property we are trying to update is valid - meaning,
if it is included inside the product schema (./models/product) I created earlier */
const isValidOperation = (body) => {
    const updates = Object.keys(body)
    const allowedUpdates = ['name']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    return isValidOperation
}

module.exports = router