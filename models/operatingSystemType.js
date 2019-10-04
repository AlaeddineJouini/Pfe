const mongoose = require('mongoose');

const operatingSystemTypeSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    }
})
const operatingSystemType = mongoose.model('operatingSystemType', operatingSystemTypeSchema);
module.exports = operatingSystemType;