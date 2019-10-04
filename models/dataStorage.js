const mongoose = require('mongoose');

const dataStorageSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dataCenter'
    }
})
const dataStorage = mongoose.model('dataStorage', dataStorageSchema);
module.exports = dataStorage;