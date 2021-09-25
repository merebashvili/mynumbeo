const mongoose = require('mongoose')
const { Schema } = mongoose;

const countrySchema = new Schema({
    "name": {
        type: String,
        required: true,
        minLength: 2
    },
    "products": [{type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
})

const Country = mongoose.model('Country', countrySchema);

module.exports = Country