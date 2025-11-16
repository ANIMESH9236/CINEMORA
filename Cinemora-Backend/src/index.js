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

// --- CORS setup ---
// You can set ALLOWED_ORIGINS in .env as a comma-separated list, e.g.
// ALLOWED_ORIGINS=https://cinemora-d2k2.vercel.app,https://cinemora-jumy.onrender.com,http://localhost:5173
const rawAllowed = process.env.ALLOWED_ORIGINS || 'https://cinemora-d2k2.vercel.app,https://cinemora-jumy.onrender.com,http://localhost:5173';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

// CORS middleware with explicit origin check (no trailing slashes)
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // If origin is not allowed, return an error (caught by error handler below)
    return callback(new Error('CORS policy: This origin is not allowed: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure preflight (OPTIONS) requests are handled
app.options('*', cors());

// Simple request logger to confirm requests are arriving
app.use((req, res, next) => {
  console.log(`➡️ ${new Date().toISOString()} ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
  next();
});

// --- Signup route ---
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('/signup handler body:', req.body);

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(422).json({ message: "User already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.SECRET_KEY || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Return token to frontend
    return res.status(201).json({
      message: "Signup successful",
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// --- Login route ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(422).json({ message: "User does not exist" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // refresh token (optional)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_KEY || 'fallback_refresh_key',
      { expiresIn: '30d' }
    );

    // Return token(s)
    return res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login Failed" });
  }
});

// --- Global error handler (including CORS origin errors) ---
app.use((err, req, res, next) => {
  console.error('Global error handler:', err && err.message ? err.message : err);
  if (err && err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ message: err.message });
  }
  // generic fallback
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
