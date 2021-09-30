const mongoose = require('mongoose')
const validator = require('validator')
const { Schema } = mongoose;
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Country = require('./country')
const Product = require('./product')

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})


// JSON.stringify() is called when we pass an object
// to response.send(), So whenever we call JSON.stringify() on an object, the
// toJSON method on that object (if there is one) gets called.
// I use this behavior to hide the properties I want to hide. In this case
// I hide password and tokens as it is not necessary for the user to see it in response.
userSchema.methods.toJSON = function () {
    const user = this
    // toObject method is a method provided by Mongoose to clean up
    // the object so it removes all of the metadata and methods
    // (like .save() or .toObject()) that Mongoose attaches to it.
    // It just becomes a regular object afterward.
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'DkyAEgFYdk')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to log in')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        // It is not necessary to be too specific, like 'Email is registered but password is incorrect',
        // as it exposes the information
        throw new Error('Unable to log in')
    }

    return user
}

// userSchema.path('email').validate(async (email) => {
//     // With this I check if email already exists
//     const emailCount = await mongoose.models.User.countDocuments({ email })
//     return !emailCount
// }, 'Email already exists')

// Hashing the plain text password before saving it
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user countries along with their products when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Country.deleteMany({ owner: user._id })
    await Product.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User