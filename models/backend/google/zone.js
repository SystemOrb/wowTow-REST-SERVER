const moongose = require('mongoose');
const uniqueValidators = require('mongoose-unique-validator');
const Schema = moongose.Schema;
const Geolocation = new Schema({
    formatted_address: {
        type: String,
        required: true
    },
    location_type: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
        unique: true
    },
    longitude: {
        type: Number,
        required: true,
        unique: true
    },
    place_id: {
        type: String,
        required: true
    }

});
moongose.plugin(uniqueValidators, {
    message: '{PATH} this zone has been loaded'
});
module.exports = moongose.model('geolocation', Geolocation);