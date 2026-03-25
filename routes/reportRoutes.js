const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

router.get('/sales', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) return res.status(400).json({ message: 'กรุณาระบุ startDate และ endDate' });

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 

        const salesDetails = await Sale.find({ createdAt: { $gte: start, $lte: end } })
            .populate('items.productId') 
            .sort({ createdAt: -1 });

        let totalBills = salesDetails.length;
        let totalSales = 0;
        let totalDiscount = 0;
        let totalCost = 0;
        let productSalesCount = {};

        salesDetails.forEach(sale => {
            totalSales += sale.netTotal;
            totalDiscount += sale.discount;

            sale.items.forEach(item => {
                let itemCost = 0;
                let itemName = 'สินค้าที่ถูกลบไปแล้ว';
                
                if (item.productId) {
                    itemCost = item.productId.cost * item.qty;
                    itemName = item.productId.name;
                }
                totalCost += itemCost;

                if (!productSalesCount[itemName]) {
                    productSalesCount[itemName] = { name: itemName, qty: 0, totalAmount: 0 };
                }
                productSalesCount[itemName].qty += item.qty;
                productSalesCount[itemName].totalAmount += (item.price * item.qty);
            });
        });

        let totalProfit = totalSales - totalCost;

        let topProducts = Object.values(productSalesCount)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        res.json({
            summary: {
                totalBills,
                totalSales,
                totalDiscount,
                totalCost,
                totalProfit
            },
            topProducts: topProducts,
            details: salesDetails
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;