const express = require('express')
const router = express.Router()
const Country = require('../models/country')

router.get('/countries/:country', async (req, res) => {
    const countryName = req.params.country

    try {
        // Here we link the existing products to the country's 'products' property according to their _ids
        await Country.findOne({name: countryName}).populate('products').exec(function (err, country) {
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