const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir); },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// 1. API เพิ่มสินค้า
router.post('/', upload.single('imageFile'), async (req, res) => {
    try {
        let finalImageUrl = req.body.imageUrl || 'https://placehold.co/200x200?text=No+Image';
        if (req.file) {
            finalImageUrl = '/uploads/' + req.file.filename;
        }

        const newProduct = new Product({
            ...req.body,
            imageUrl: finalImageUrl
        });
        
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ', data: savedProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. API ดึงข้อมูลสินค้า
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. API แก้ไขข้อมูลสินค้า
router.put('/:id', upload.single('imageFile'), async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = '/uploads/' + req.file.filename;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', data: updatedProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. API ลบข้อมูลสินค้า
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;