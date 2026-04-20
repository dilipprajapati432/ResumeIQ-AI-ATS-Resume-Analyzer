const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeResume } = require('../controllers/analyzeController');
const { analyzeLimiter } = require('../middleware/rateLimiter');


router.post('/analyze', analyzeLimiter, upload.single('resumeFile'), analyzeResume);

module.exports = router;
