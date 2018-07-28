const moongose = require('mongoose');
const Schema = moongose.Schema;
const Average = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'clients',
        required: true
    },
    average: {
        type: Number,
        required: true,
        default: 0
    },
    feedback: {
        type: String,
        required: false
    }
});
module.exports = moongose.model('client_rating', Average);