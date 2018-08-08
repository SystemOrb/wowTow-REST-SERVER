const moongose = require('mongoose');
const Schema = moongose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const COUPONS = new Schema({
    city: {
        type: Schema.Types.ObjectId,
        ref: 'city_rate',
        required: true,
        unique: true
    },
    amount_discount: {
        type: Number,
        required: true
    },
    date_start: {
        type: Date,
        required: true
    },
    date_end: {
        type: Date,
        required: true
    }
});
COUPONS.plugin(uniqueValidator, {
    message: '{PATH} Your have a discount with coupon for this city'
});
module.exports = moongose.model('city_coupons', COUPONS);