const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String, default: 'https://placehold.co/200x200?text=No+Image' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);