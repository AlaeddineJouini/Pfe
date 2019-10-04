const mongoose = require('mongoose');

const operatingSystemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'operatingSystemType'
    }
})
const operatingSystem = mongoose.model('operatingSystem', operatingSystemSchema);
module.exports = operatingSystem;