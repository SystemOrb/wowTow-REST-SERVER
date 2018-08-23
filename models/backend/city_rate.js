const moongose = require('mongoose');
const Schema = moongose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const CityRate = new Schema({
    geozone: {
        type: Schema.Types.ObjectId,
        ref: 'geolocation',
        required: true
    },
    base_rate: {
        type: Number,
        required: true
    },
    city_discount: {
        type: Number,
        required: false,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    }
});
CityRate.plugin(uniqueValidator, {
    message: '{PATH} city has been loaded with a base rate'
});
module.exports = moongose.model('city_rate', CityRate);