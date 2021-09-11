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

    try {
        const productToBeUpdated = await Product.findByIdAndUpdate(_id, req.body)

        if (!productToBeUpdated) {
            return res.status(404).send()
        }

        res.send(productToBeUpdated)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})