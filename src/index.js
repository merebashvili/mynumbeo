const express = require('express')
const productRouter = require('./routers/product')
const countryRouter = require('./routers/country')

//connect Mongoose to the db
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000

// Automatically parse incoming JSON to an object
app.use(express.json())
app.use(productRouter)
app.use(countryRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})