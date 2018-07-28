const moongose = require('mongoose');
const Schema = moongose.Schema;
const Average = new Schema({
    employer: {
        type: Schema.Types.ObjectId,
        ref: 'grueros',
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
module.exports = moongose.model('employer_rating', Average);