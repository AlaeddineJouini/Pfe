const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;


// User Schema
const userSchema = new Schema({
    email: { type: String },
    password: String,
    firstName: {type: String},
    lastName: {type: String},
    role: {type: String, default: "client"},
    activation: {type: Boolean, default: false},
    verification: {type: Boolean, default: false},
    cloud: {type: String,default :null},
    dc: {type: String,default :null},
    cluster: {type: String,default :null},
    cidr : {type: String , default :"24"},
    ds: {type: String,default :null},
    gw: {type: String,default :null},
    dns: {type: String,default :null},
    dn: {type: String,default :null},
    iprange: [{type: mongoose.Schema.Types.ObjectId, ref: 'ips', default : []}],
    vlan: {type: Number,default :null},

   
}, { timestamps: true });


// methods ======================
// we have two type of methods: 'methods', and 'statics'.
// 'methods' are private to instances of the object User, which allows the use of 'this' keyword.
// 'statics' are attached to the user object, so that you don't need an instance of the object created with the keyword 'new' to actually call the function.

// generating a hash
// passwords are not saved to the database as is. Instead, they are hashed first, then saved.
// hashes are always the same for the same password given the same "salt".
userSchema.statics.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
// this method takes the password, hashes it, and compares it to the user's own password
// when the two hashes are equal, it means the passwords match
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.isClient = function() {
    return (this.role === "client");
};
userSchema.methods.isVerified = function() {
    return (this.verification );
};
userSchema.methods.isActivated = function() {
    return (this.activation );
};
userSchema.methods.isAdmin = function() {
    return (this.role === "admin");
};
userSchema.methods.isSuper = function() {
    return (this.role === "super");
};

module.exports = mongoose.model('User', userSchema);