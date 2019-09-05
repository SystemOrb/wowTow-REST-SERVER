const moongose = require('mongoose');
const Schema = moongose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const ExpirationDoc = new Schema({
    doc: {
        type: Schema.Types.ObjectId,
        ref: 'gru_docs',
        required: true
    },
    expiration: {
        type: Date,
        required: true
    }
});
ExpirationDoc.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});
module.exports = moongose.model('gru_doc_expiiration', ExpirationDoc);