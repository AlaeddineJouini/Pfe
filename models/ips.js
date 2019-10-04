const mongoose = require('mongoose');

const ipsSchema = mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    available: {
        type: Boolean
    }
    
    
})
const ips = mongoose.model('ips', ipsSchema);
module.exports = ips;