// Para las imagenes de las gruas cargadas por los conductores
const moongose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = moongose.Schema;
const towImages = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'tows_car',
        required: true,
        unique: true
    },
    tow_image: {
        type: String,
        required: true
    }
});
moongose.plugin(uniqueValidator, {
    message: '{PATH} must be unique or you request status is pending'
})
module.exports = moongose.model('tow_images', towImages);