require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./Middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const userRoutes = require('./routes/userRoutes');
const userPrivateRoutes = require('./routes/userPrivateRoutes');
const adminSeriesRoutes = require('./routes/adminSeriesRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Request logger
app.use((req, res, next) => {
  console.log(`➡️ ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userPrivateRoutes);
app.use('/api/admin/series', adminSeriesRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Export app for testing
module.exports = app;
    
// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
});
}
