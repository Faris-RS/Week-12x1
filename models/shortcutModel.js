const mongoose = require('mongoose');

const ShortCutSchema = new mongoose.Schema({
    name: {
        type: Array,
        required: true
    }
})

module.exports = ShortCutModel = mongoose.model('ShortCut',ShortCutSchema);