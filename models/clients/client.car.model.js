const moongose = require('mongoose');
const Schema = moongose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const ClientCarModel = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    car_name: {
        type: String,
        required: true
    },
    car_colour: {
        type: String,
        required: true
    },
    car_plate: {
        type: String,
        required: true,
        unique: true
    },
    car_model: {
        type: String,
        required: false
    }
});
ClientCarModel.plugin(uniqueValidator, {
    message: '{PATH} already exists'
});
module.exports = moongose.model('client_car', ClientCarModel);