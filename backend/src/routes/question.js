const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Minimal — question CRUD is handled in admin routes
// This file exists for future public question endpoints (e.g., search)
module.exports = router;
