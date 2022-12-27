const mongoose = require('mongoose');

const coupenSchema = new mongoose.Schema({
    coupenName: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    maximum: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Active'
    }
})

module.exports = coupenModel = mongoose.model('CoupenData',coupenSchema);