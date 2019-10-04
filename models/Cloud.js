const mongoose = require('mongoose');
const cluster = require('./cluster');
const ds = require('./dataStorage');

const CloudSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    adress: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    }

})

const Cloud = mongoose.model('Cloud', CloudSchema);
module.exports = Cloud;