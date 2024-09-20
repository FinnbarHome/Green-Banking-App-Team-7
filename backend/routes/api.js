// routes/api.js
const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Route to get all companies
router.get('/companies', async (req, res) => {
    try {
        const companies = await Company.find();
        if (companies.length === 0) {
            return res.status(404).json({ msg: 'No companies found' });
        }
        res.json(companies);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
