const mongoose = require('mongoose')

const Product = mongoose.model('Product', {
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
    }
  })

  // TO DO
  // product should be unique

module.exports = Product