const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Member = require('../models/Member'); // ดึงโมเดล Member มาใช้

// API บันทึกการขาย ตัดสต๊อก และเพิ่มแต้มสมาชิก
router.post('/', async (req, res) => {
    try {
        const saleData = req.body;

        // 1. บันทึกข้อมูลบิลลง Database
        const newSale = new Sale(saleData);
        await newSale.save();

        // 2. ตัดสต๊อกสินค้า
        for (let item of saleData.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.qty } // ลดสต๊อกตามจำนวนที่ซื้อ
            });
        }

        // 3. ระบบสะสมแต้ม (ถ้ามีการใส่เบอร์สมาชิกมา)
        let earnedPoints = 0;
        let memberName = "";
        
        if (saleData.memberPhone) {
            // สมมติ: ยอดซื้อทุกๆ 10 บาท ได้ 1 แต้ม (เช่น ซื้อ 150 บาท ได้ 15 แต้ม)
            earnedPoints = Math.floor(saleData.netTotal / 10); 

            // ค้นหาสมาชิกด้วยเบอร์โทร แล้วบวกแต้มเข้าไป
            const member = await Member.findOneAndUpdate(
                { phone: saleData.memberPhone },
                { $inc: { points: earnedPoints } },
                { new: true } // ให้คืนค่าข้อมูลใหม่กลับมา
            );

            if (member) {
                memberName = member.name;
            } else {
                earnedPoints = 0; // ถ้าหาเบอร์ไม่เจอ ก็ไม่ได้แต้ม
            }
        }

        // ส่งผลลัพธ์กลับไปหน้าเว็บ พร้อมบอกแต้มที่ได้
        res.status(201).json({ 
            message: 'บันทึกการขายสำเร็จ', 
            earnedPoints: earnedPoints,
            memberName: memberName
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;