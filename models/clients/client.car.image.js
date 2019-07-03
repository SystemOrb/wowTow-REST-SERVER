const moongose = require('mongoose');
const Schema = moongose.Schema;
const CarProfile = new Schema({
    car_model: {
        type: Schema.Types.ObjectId,
        ref: 'client_car',
        required: true,
    },
    car_image: {
        type: String,
        required: true
    }
});
module.exports = moongose.model('car_images', CarProfile);