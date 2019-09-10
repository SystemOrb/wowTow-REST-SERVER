/*
Tabla que se encarga de construir todas las tarifas
*/

const moongose = require('mongoose');
const Schema = moongose.Schema;

const WootowTaxSystem = new Schema({
    extra_miles: { // Valor de la distancia extra
        type: Number,
        required: true
    },
    car_truck: { // Tipo del vehiculo
        type: Schema.Types.ObjectId,
        ref: 'cars_type',
        required: true
    },
    dispatch_service: { // La tarifa que cobrará wootow por servicio
        type: Number,
        required: true
    },
    max_miles: { // La cantidad de millas maxima, luego es millas extras ejemplo 0 < 30 = 30 millas maximas
        type: Number,
        required: true
    },
    wootow_fee: { // La comisión que cobra wootow por servicio
        type: Number,
        required: true
    },
    charge_nigth: { // Tarifa extra que se cobra por la noche
        type: Number,
        required: true
    }
});