const moongose = require('mongoose');
const Schema = moongose.Schema;

const WootowExtraMiles = new Schema({
    car_type: { // Vehiculo donde se le va aplicar millas extras
        type: Schema.Types.ObjectId,
        ref: 'cars_type',
        required: true
    },
    extra_miles: { // valor de las millas extras 
        type: Number,
        required: true
    },
    city: { // Ciudad a la que se le aplicará las millas extras
        type: Schema.Types.ObjectId,
        ref: 'city_fee',
        required: true
    }
});

module.exports = moongose.model('cars_extra_miles', WootowExtraMiles);