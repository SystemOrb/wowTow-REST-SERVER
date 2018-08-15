const moongose = require('mongoose');
const Schema = moongose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const ControlRisk = new Schema({
    car_model: {
        type: Schema.Types.ObjectId,
        ref: 'client_car',
        required: true
    },
    risk_average: {
        type: String,
        required: true,
        default: 'NORMAL',
        enum: {
            values: ['NORMAL', 'SERIOUS', 'VERY SERIOUS'],
            message: '{VALUE} is invalid'
        }
    },
    risk_comment: {
        type: String,
        required: true
    },
    risk_status: { // Si el ticket fue atendido
        type: Boolean,
        default: false,
        required: true
    },
    risk_date: {
        type: String,
        required: true
    }
});
ControlRisk.plugin(uniqueValidator, {
    message: '{PATH} is invalid'
});
module.exports = moongose.model('client_risk', ControlRisk);