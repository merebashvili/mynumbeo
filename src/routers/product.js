const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const Country = require('../models/country')
const { isValidOperation } = require('../shared/shared')

router.post('/products', async (req, res) => {
    // Whenever we create a new product, it checks if the product country is already created.
    const newProduct = new Product(req.body)
    const productCountry = req.body.country
    const foundCountry = await Country.findOne({name: productCountry})

    try {
        // if our new product is from new country, it will automatically add new country to the
        // countries collection, along with creating new product
        if (!foundCountry) {
            const newCountry = new Country({
                name: productCountry,
                products: [newProduct._id]
            })

            // Here I reassign product country property from 'name' to country's 'ObjectId'.
            // Why? because if let's say at some point we need to change country name, we will only need
            // to change country name (./country.js PATCH), without changing its products' country names as well.
            newProduct.country = newCountry._id
            await newCountry.save()
        } else {
        // If the product country is already created, country's existing products will be updated

            foundCountry.products.push(newProduct._id)
            newProduct.country = foundCountry._id
            await foundCountry.save()
        }
        await newProduct.save()
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
    const allowedUpdates = ['product', 'price_in_local', 'price_in_usd', 'quantity_for_month']

    // TO DO
    // See if there is a shorter way to validate
    if (!isValidOperation(req.body, allowedUpdates)) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        /* Without {returnOriginal: false}, productToBeUpdated will give me the old (preupdated) product.
        Also, without {runValidators: true}, there will be no validation check,
        e.g. I can set "quantity_for_month" to 0, even though I have set the
        minimum quantity to 1 in product schema (./models/product) */
        const productToBeUpdated = await Product.findByIdAndUpdate(_id, req.body, {returnOriginal: false, runValidators: true})

        if (!productToBeUpdated) {
            return res.status(404).send()
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
            return res.status(404).send()
        }

        // Whenever we delete particular product, that product should also be deleted
        // from the list of country's products, right?
        let productCountry = await Country.findById(productToBeDeleted.country)
        productCountry.products = productCountry.products.filter(product => !product.equals(productToBeDeleted._id))

        await Country.findByIdAndUpdate(productToBeDeleted.country, productCountry)

        res.send(productToBeDeleted)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router