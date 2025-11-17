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

// Use env var (ensure it includes protocol e.g. https://cinemora-eight.vercel.app)
const allowedOrigin = process.env.ALLOWED_ORIGINS || 'https://cinemora-eight.vercel.app';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET','POST'],
  allowedHeaders: ['Content-Type','Authorization']
}));


// app.use(cors()); // allow all origins for debugging (dev only)

// simple request logger to confirm requests are arriving
app.use((req, res, next) => {
  console.log(`➡️ ${new Date().toISOString()} ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
  next();
});

// ✅ SIGNUP ROUTE
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('/signup handler body:', req.body);

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
      process.env.SECRET_KEY,
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

// ✅ LOGIN ROUTE
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

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
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    // refresh token
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_KEY,
      { expiresIn: '30d' }
    )

    // Return token
    return res.status(200).json({
      message: "Login successful",
      token,refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({ message: "Login Failed" });
  }
});


// Start server — use uppercase PORT and bind to 0.0.0.0 for Render
const PORT = process.env.PORT || 8080;   // Render provides PORT (uppercase)
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
});

