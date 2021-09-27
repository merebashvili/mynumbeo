/* Checks if the property we are trying to update is valid - meaning,
if it is included inside the particular schema (../models) I created earlier */
const isValidOperation = (requestBody, allowedUpdates) => {
    const updates = Object.keys(requestBody)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    return isValidOperation
}

const updateManually = (requestBody, resourceToBeUpdated) => {
    const updates = Object.keys(requestBody)
    updates.forEach(update => resourceToBeUpdated[update] = requestBody[update])
    return resourceToBeUpdated
}

module.exports = { isValidOperation, updateManually }