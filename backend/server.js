require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const analyzeRoutes = require('./src/routes/analyzeRoutes');
const { apiLimiter } = require('./src/middleware/rateLimiter');


const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate rate limiting (e.g. for Render, Heroku)
app.set('trust proxy', 1);


// Middleware
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api', apiLimiter, analyzeRoutes);


// Health Check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve Frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist'))); // Changed build to dist for Vite

app.get('*', (req, res) => {
  const p = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  if (fs.existsSync(p)) {
    res.sendFile(p);
  } else {
    res.json({ message: "API Live." });
  }
});

app.listen(PORT, () => console.log(`🚀 API on ${PORT}`));
