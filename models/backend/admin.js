// ADMIN LOGIN TO BACKEND
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const ADMIN = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    ROLE: {
        type: String,
        required: true,
        default: 'ASIST_ROLE',
        enum: {
            values: ['ASIST_ROLE', 'ADMIN_ROLE'],
            message: '{VALUE} is invalid'
        }
    },
    status: {
        type: Boolean,
        default: true
    }
});
// We dont need send password for JSON_RESPONSE
// So we remove this parameter on frontend
ADMIN.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}
ADMIN.plugin(uniqueValidator, {
    message: 'Error, {PATH} must be unique'
});
module.exports = mongoose.model('AdminUsers', ADMIN);