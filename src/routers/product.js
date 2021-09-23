const express = require('express')
const router = express.Router()
const {Product, Country} = require('../models/product')

router.post('/products', async (req, res) => {
    const newProduct = new Product(req.body)
    const productCountry = req.body.country
    const foundCountry = await Country.findOne({name: productCountry})

    try {
        await newProduct.save()
        if (!foundCountry) {
            const newCountry = new Country({
                name: productCountry,
                products: [newProduct._id]
            })

            newCountry.save()
        } else {
            foundCountry.products.push(newProduct._id)
            foundCountry.save()
        }
        res.status(201).send(newProduct)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.send(products)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/countries/:country', async (req, res) => {
    const countryName = req.params.country

    try {
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

router.get('/products/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const foundProduct = await Product.findById(_id)

        if (!foundProduct) {
            return res.status(404).send()
        }

        res.send(foundProduct)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/products/:id', async (req, res) => {
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
        const productToBeUpdated = await Product.findByIdAndUpdate(_id, req.body, {returnOriginal: false, runValidators: true})

        if (!productToBeUpdated) {
            return res.status(400).send()
        }

        res.send(productToBeUpdated)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/products/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const productToBeDeleted = await Product.findByIdAndDelete({_id})

        if (!productToBeDeleted) {
            return res.status(400).send()
        }

        res.send(productToBeDeleted)
    } catch (e) {
        res.status(500).send(e)
    }
})

/* Checks if the property we are trying to update is valid - meaning,
if it is included inside the product schema (./models/product) I created earlier */
const isValidOperation = (body) => {
    const updates = Object.keys(body)
    const allowedUpdates = ['product', 'price_in_local', 'price_in_usd', 'quantity_for_month']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    return isValidOperation
}

module.exports = router