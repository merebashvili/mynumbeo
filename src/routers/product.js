const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Country = require('../models/country');
const auth = require('../middleware/auth');
const { isValidOperation, updateManually } = require('../shared/shared');

router.post('/products', auth, async (req, res) => {
  const owner = req.user._id;
  req.body.owner = owner;
  // Whenever we create a new product, it checks if the product country is already created.
  const newProduct = new Product(req.body);
  const productCountry = req.body.country;
  const foundCountry = await Country.findOne({ name: productCountry, owner });

  try {
    // if our new product is from new country, it will automatically add new country to the
    // countries collection, along with creating new product
    if (!foundCountry) {
      const newCountry = new Country({
        name: productCountry,
        products: [newProduct._id],
        owner,
      });

      // Here I reassign product country property from 'name' to country's 'ObjectId'.
      // Why? because if let's say at some point we need to change country name, we will only need
      // to change country name (./country.js PATCH), without changing its products' country names as well.
      newProduct.country = newCountry._id;
      await newCountry.save();
    } else {
      // If the product country is already created, country's existing products will be updated

      foundCountry.products.push(newProduct._id);
      newProduct.country = foundCountry._id;
      await foundCountry.save();
    }
    await newProduct.save();
    res.status(201).send(newProduct);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/products/me', auth, async (req, res) => {
  const owner = req.user._id;
  try {
    const products = await Product.find({ owner });
    res.send(products);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/products/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const owner = req.user._id;

  try {
    const foundProduct = await Product.findOne({ _id, owner });

    if (!foundProduct) {
      return res.status(404).send();
    }

    res.send(foundProduct);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/products/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const owner = req.user._id;
  const allowedUpdates = [
    'product',
    'price_in_local',
    'price_in_usd',
    'quantity_for_month',
  ];

  if (!isValidOperation(req.body, allowedUpdates)) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    let productToBeUpdated = await Product.findOne({ _id, owner });
    productToBeUpdated = await updateManually(req.body, productToBeUpdated);

    if (!productToBeUpdated) {
      return res.status(404).send();
    }

    await productToBeUpdated.save();

    res.send(productToBeUpdated);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete('/products/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const owner = req.user._id;

  try {
    const productToBeDeleted = await Product.findOneAndDelete({ _id, owner });
    if (!productToBeDeleted) {
      return res.status(404).send();
    }

    // Whenever we delete particular product, that product should also be deleted
    // from the list of country's products, right?
    let productCountry = await Country.findById(productToBeDeleted.country);
    productCountry.products = productCountry.products.filter(
      (product) => !product.equals(productToBeDeleted._id)
    );

    await Country.findByIdAndUpdate(productToBeDeleted.country, productCountry);

    res.send(productToBeDeleted);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
