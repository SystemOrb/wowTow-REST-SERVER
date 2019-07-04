// Documentos personales de grueros
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const PrivateDocuments = new Schema({
    document_name: {
        type: String,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Grueros',
        required: true
    },
    documentType: {
        type: String,
        required: true,
        unique: true,
        enum: {
            // values: ['DNI', 'LICENSEX', 'POLICY', 'PASSPORT', 'SELFIE', 'RESIDENCE'],
            message: '{VALUE} is invalid'
        }
    },
    documentStatus: {
        type: Boolean,
        default: false,
        required: true
    }
});
PrivateDocuments.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});
module.exports = mongoose.model('gru_docs', PrivateDocuments);