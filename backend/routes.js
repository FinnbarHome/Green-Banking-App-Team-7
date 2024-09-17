const express = require('express');
const router = express.Router();

// Simple API route for testing
router.get('/', (req, res) => {
  res.send('API is working!');
});

module.exports = router;
