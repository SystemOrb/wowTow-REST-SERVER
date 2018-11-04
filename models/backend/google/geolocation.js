const moongose = require('mongoose');
const Schema = moongose.Schema;
const Zone = new Schema({
    // Origin zone
    fromLng: {
        type: Number,
        required: true
    },
    fromLat: {
        type: Number,
        required: true
    },
    // Destiny zone
    toLng: {
        type: Number,
        required: true
    },
    toLat: {
        type: Number,
        required: true
    },
    service_ref: {
        type: Schema.Types.ObjectId,
        ref: 'stripe_payments',
        unique: true,
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'client_car',
        required: true
    },
    tracking: {
        type: Boolean,
        required: true,
        default: false
    }
});
module.exports = moongose.model('payments_graphic', Zone);