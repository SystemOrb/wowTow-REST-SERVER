/*
Tabla que se va a encargar de registrar las gruas y el precio establecido de cada una
*/
const moongose = require('mongoose');
const Schema = moongose.Schema;

const CarType = new Schema({
    car_type: {
        type: String,
        required: true
    },
    car_truck: {
        type: String,
        required: true,
        enum: {
            values: ['Hook', 'Flatbet'],
            message: '{VALUE} is invalid'
        }
    },
    truck_price: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = moongose.model('cars_type', CarType);