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

module.exports = router