const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    receiptNumber: { type: String, required: true, unique: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }, 
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, 
    
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true },   
        price: { type: Number, required: true } 
    }],
    
    subTotal: { type: Number, required: true }, 
    discount: { type: Number, default: 0 },     
    netTotal: { type: Number, required: true }, 

    paymentMethod: { type: String, enum: ['cash', 'credit', 'promptpay'], required: true },
    amountPaid: { type: Number, required: true }, 
    change: { type: Number, default: 0 }          
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);