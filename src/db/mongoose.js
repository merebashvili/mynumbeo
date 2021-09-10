const mongoose = require('mongoose')

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/mynumbeo');
}

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

product.save()