const mongoose = require('mongoose');


const VlanSchema = mongoose.Schema({
    name: {
        type: String,
        default : 'vlan'
    },
    vnum: {
        type: Number,
        required: true
    }

})

const Vlan = mongoose.model('Vlan', VlanSchema);
module.exports = Vlan;