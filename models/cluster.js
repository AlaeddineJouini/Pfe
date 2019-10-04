const mongoose = require('mongoose');

const clusterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dataCenter'
    }
})
const cluster = mongoose.model('cluster', clusterSchema);
module.exports = cluster;