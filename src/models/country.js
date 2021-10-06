const mongoose = require('mongoose');
const { Schema } = mongoose;
const Product = require('./product');

const countrySchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

countrySchema.pre('remove', async function (next) {
  const { _id, owner } = this;
  await Product.deleteMany({ country: _id, owner });
  next();
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
