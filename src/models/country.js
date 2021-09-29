const mongoose = require('mongoose')
const { Schema } = mongoose;

const countrySchema = new Schema({
    "name": {
        type: String,
        required: true,
        minLength: 2
    },
    "products": [{type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    "owner": {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'}
})

const Country = mongoose.model('Country', countrySchema);

module.exports = Country