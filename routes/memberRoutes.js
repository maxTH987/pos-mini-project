const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// 1. เพิ่มสมาชิกใหม่
router.post('/', async (req, res) => {
    try {
        const newMember = new Member(req.body);
        const savedMember = await newMember.save();
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', data: savedMember });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. ดึงข้อมูลสมาชิกทั้งหมด
router.get('/', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. แก้ไขข้อมูลสมาชิก
router.put('/:id', async (req, res) => {
    try {
        const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', data: updatedMember });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. ลบข้อมูลสมาชิก
router.delete('/:id', async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;