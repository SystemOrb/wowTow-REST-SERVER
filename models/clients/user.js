// Schema model of data from the users
// Client data manipulation for app
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    GOOGLE: {
        type: Boolean,
        default: false
    }
});
// We dont need send password for JSON_RESPONSE
// So we remove this parameter on frontend
UserSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}
UserSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});
module.exports = mongoose.model('Client', UserSchema);