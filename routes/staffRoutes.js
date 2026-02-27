const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// 1. API สำหรับเพิ่มพนักงานใหม่
router.post('/', async (req, res) => {
    try {
        const newStaff = new Staff(req.body);
        const savedStaff = await newStaff.save();
        res.status(201).json({ message: 'เพิ่มพนักงานสำเร็จ', data: savedStaff });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. API สำหรับดึงข้อมูลพนักงานทั้งหมด
router.get('/', async (req, res) => {
    try {
        const staffList = await Staff.find();
        res.json(staffList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. API สำหรับ Login ตรวจสอบผู้ใช้งาน
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // ค้นหาพนักงานที่มี username และ password ตรงกันในฐานข้อมูล
        const staff = await Staff.findOne({ username: username, password: password });
        
        if (staff) {
            // ถ้าเจอ ให้ส่งข้อมูลชื่อและสิทธิ์กลับไป
            res.json({ message: 'เข้าสู่ระบบสำเร็จ', data: { name: staff.name, role: staff.role } });
        } else {
            // ถ้าไม่เจอ แปลว่ารหัสผิด
            res.status(401).json({ error: 'Username หรือ รหัสผ่านไม่ถูกต้อง!' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;