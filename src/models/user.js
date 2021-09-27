const mongoose = require('mongoose')
const validator = require('validator')
const { Schema } = mongoose;
const bcrypt = require('bcryptjs')

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
    }
})

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

userSchema.path('email').validate(async (email) => {
    // With this I check if email already exists
    const emailCount = await mongoose.models.User.countDocuments({ email })
    return !emailCount
}, 'Email already exists')

// Hashing the plain text password before saving it
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User