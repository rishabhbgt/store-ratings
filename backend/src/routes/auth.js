const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validate } = require('../validators');
const { auth } = require('../middleware/auth');

router.post('/signup', async (req, res) => {
    try {
        const errors = validate(req.body, ['name', 'email', 'address', 'password']);
        if (errors.length) return res.status(400).json({ message: errors[0], errors });

        const { name, email, address, password } = req.body;
        const hash = await bcrypt.hash(password, 10); // 10 = hashing ki strength

        const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email.toLowerCase(), hash, address, 'USER']
    );
    res.status(201).json({ id: result.insertId, name, email: email.toLowerCase(), role: 'USER' });
    } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').toLowerCase();
        const password = String(req.body.password || '');

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
    }
});

router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const errors = validate({ password: newPassword }, ['password']);
        if (errors.length) return res.status(400).json({ message: errors[0], errors });

        const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (!rows[0]) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (!(await bcrypt.compare(String(currentPassword || ''), rows[0].password_hash))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
        res.json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;