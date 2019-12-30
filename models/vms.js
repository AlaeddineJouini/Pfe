const mongoose = require('mongoose');

const VmsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cloud: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cloud'
    },
    cpus: {
        type: Number,
        required: true
    },
    cluster:{
        type: String,
        required : true
    },
    dc:{
        type:String,
        required:true,
    },
    ds:{
        type: String,
        required : true
    },
    disk :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'disk'
    }],
    network:{
        ip:{
            type: String,
            required: true
        },
        vlan:{
            type: Number,
            required: true
        },
        cidr:{
            type: Number,
            required: true
        },
        numberOfNetworks : {
            type: Number,
            required: true
        }
    },
    memory:{
        type: Number,
        required: true
    },
    dn:{
        type:String,
        required: true
    },
    gw:{
        type: String,
        required: true
    },
    dns:{
        type: String,
        required: true
    },
    vmpw:{
        type: String,
        required: true
    },
    projectFolder:{
        type: String,
        required: true
    },
    osType:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'operatingSystemType'
    },
    os:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'operatingSystem'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});
const vms = mongoose.model('vms', VmsSchema);
module.exports = vms;
