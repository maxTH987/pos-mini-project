const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },              
    name: { type: String, required: true },                   
    role: { type: String, enum: ['staff', 'owner'], default: 'staff' } 
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);