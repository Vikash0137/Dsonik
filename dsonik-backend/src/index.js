const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(helmet());

// Allow public frontend, admin origins, and production domains
const parseOrigins = (val) => (val ? val.split(',').map((s) => s.trim()) : []);
const allowedOrigins = [
	'https://dsonik.onrender.com',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5176',
	...parseOrigins(process.env.FRONTEND_URL),
	...parseOrigins(process.env.ADMIN_URL)
].filter(Boolean);

app.use(cors({
	origin: function (origin, callback) {
		// allow non-browser requests like curl/postman (no origin)
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error(`Not allowed by CORS: ${origin}`));
	},
	credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limiting
const limiter = require('./middleware/rateLimit');
app.use(limiter);

// connect db
const connectDB = require('./config/db');
connectDB();

// routes (placeholders)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin/products', require('./routes/admin/products'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/categories', require('./routes/admin/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin/uploads', require('./routes/admin/uploads'));
app.use('/api/admin/users', require('./routes/admin/users'));

// error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);


app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
