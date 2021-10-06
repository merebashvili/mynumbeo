const express = require('express');
const productRouter = require('./routers/product');
const countryRouter = require('./routers/country');
const userRouter = require('./routers/user');

//connect Mongoose to the db
require('./db/mongoose');

const app = express();

// Automatically parse incoming JSON to an object
app.use(express.json());
app.use(productRouter);
app.use(countryRouter);
app.use(userRouter);

module.exports = app;
