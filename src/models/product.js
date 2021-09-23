const mongoose = require('mongoose')
const { Schema } = mongoose;

const productSchema = new Schema({
    "product": {
        type: String,
        required: true,
        minLength: 2
    },
    "price_in_local": {
        type: Number,
        required: true,
        min: 0.01
    },
    "price_in_usd": {
        type: Number,
        required: true,
        min: 0.01
    },
    "quantity_for_month": {
        type: Number,
        required: true,
        min: 1
    },
    "country": {
        type: String,
        required: true,
        minLength: 2
    }
})

const countrySchema = new Schema({
    "name": {
        type: String,
        required: true,
        minLength: 2
    },
    "products": [{type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
})

  // TO DO
  // product should be unique

  const Product = mongoose.model('Product', productSchema);
  const Country = mongoose.model('Country', countrySchema);

  module.exports = { Product, Country }