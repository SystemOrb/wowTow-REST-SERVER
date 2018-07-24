// Schema Data for grueros
const mongosee = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongosee.Schema;

// Schema
const EmployerSchema = new Schema({
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
        required: true,
        default: true
    },
    statusWork: { // If can work or not
        type: Boolean,
        required: true,
        default: false
    },
    authorized: {
        // If he can work by system need verify documents
        type: Boolean,
        required: true,
        default: false
    }
});
// We dont need send password for JSON_RESPONSE
// So we remove this parameter on frontend
EmployerSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}
EmployerSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});
module.exports = mongosee.model('Grueros', EmployerSchema);