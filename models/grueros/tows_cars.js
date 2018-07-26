// Para afiliar la grua del conductor
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const TowCar = new Schema({
    tow_name: {
        type: String,
        required: true
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Grueros',
        required: true
    },
    tow_plate: {
        type: String,
        required: true,
        unique: true
    },
    tow_model: {
        type: String,
        required: true
    },
    tow_authorized: {
        type: Boolean,
        default: false,
        required: true
    }
});
TowCar.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});
module.exports = mongoose.model('tows_car', TowCar);