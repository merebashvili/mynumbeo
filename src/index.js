const { ObjectID } = require('bson')
const express = require('express')

//connect Mongoose to the db
require('./db/mongoose')
const Product = require('./models/product')

const app = express()
const port = process.env.PORT || 3000

// Automatically parse incoming JSON to an object
app.use(express.json())

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body)

    try {
        await newProduct.save()
        res.status(201).send(newProduct)
    } catch (e) {
        res.status(400).send(e)
    }
})

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.send(products)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.get('/products/:id', async (req, res) => {
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

app.patch('/products/:id', async (req, res) => {
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

/* Checks if the property we are trying to update is valid - meaning,
if it is included inside the product schema (./models/product) I created earlier */
const isValidOperation = (body) => {
    const updates = Object.keys(body)
    const allowedUpdates = ['product', 'price_in_local', 'price_in_usd', 'quantity_for_month']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    return isValidOperation
}

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})