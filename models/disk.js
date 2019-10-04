const mongoose = require('mongoose');

const diskSchema = mongoose.Schema({
    name:{
        type: String,
        required: false
    },
    size:{
        type: Number,
        required: false
    },
    persistent:{
        type: Boolean
    }
});
const disk = mongoose.model('disk', diskSchema);
module.exports = disk;