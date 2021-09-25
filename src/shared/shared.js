/* Checks if the property we are trying to update is valid - meaning,
if it is included inside the particular schema (../models) I created earlier */
const isValidOperation = (body, allowedUpdates) => {
    const updates = Object.keys(body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    return isValidOperation
}

exports.isValidOperation = isValidOperation