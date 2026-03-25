const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },               
    points: { type: Number, default: 0 }                  
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);