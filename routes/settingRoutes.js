const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get all settings or a specific setting
router.get('/', async (req, res) => {
    try {
        const { key } = req.query;
        if (key) {
            const setting = await Setting.findOne({ key });
            return res.json(setting ? setting.value : null);
        }
        const settings = await Setting.find();
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update or create a setting
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) return res.status(400).json({ error: 'Key is required' });

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true }
        );
        res.json({ message: 'Setting saved successfully', setting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
