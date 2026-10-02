require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/owner', require('./routes/owner'));

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS users FROM users');
        res.json({ status: 'ok', users: rows[0].users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));