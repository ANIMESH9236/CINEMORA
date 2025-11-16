// index.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Read allowed origins from env (comma-separated) or fallback to common ones for local dev
const rawAllowed = process.env.ALLOWED_ORIGINS || 'https://cinemora-d2k2.vercel.app,https://cinemora-jumy.onrender.com,http://localhost:5173';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

// CORS middleware with explicit origin check
app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser tools (Postman, curl) which send no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed: ' + origin));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Safe preflight OPTIONS handler (do NOT register app.options('*', cors()))
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization');
      return res.sendStatus(204);
    }
    return res.status(403).json({ message: 'CORS policy: This origin is not allowed: ' + origin });
  }
  next();
});

// request logger
app.use((req, res, next) => {
  console.log(`➡️ ${new Date().toISOString()} ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
  next();
});

// -- Signup --
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(422).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({ data: { name, email, password: hashedPassword } });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.SECRET_KEY || 'fallback_secret_key', { expiresIn: '7d' });

    return res.status(201).json({ message: 'Signup successful', token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

// -- Login --
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(422).json({ message: 'User does not exist' });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET_KEY || 'fallback_secret_key', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_KEY || 'fallback_refresh_key', { expiresIn: '30d' });

    return res.status(200).json({ message: 'Login successful', token, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login Failed' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err && err.message ? err.message : err);
  if (err && err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server: use env PORT (Render provides this)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
