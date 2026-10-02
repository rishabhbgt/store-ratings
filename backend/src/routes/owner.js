const router = require('express').Router();
const db = require('../db');
const { auth, allow } = require('../middleware/auth');

router.use(auth, allow('OWNER'));

const sortMap = { name: 'u.name', email: 'u.email', rating: 'r.rating' };

router.get('/dashboard', async (req, res) => {
    try {

        const [stores] = await db.query(
        `SELECT s.id, s.name, ROUND(AVG(r.rating), 1) AS average, COUNT(r.id) AS total_ratings
        FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id = ? GROUP BY s.id`,
        [req.user.id]
        );

        const col = sortMap[req.query.sort] || 'u.name';
        const dir = req.query.order === 'desc' ? 'DESC' : 'ASC';
        const [raters] = await db.query(
        `SELECT u.id, u.name, u.email, r.rating, s.name AS store
        FROM ratings r
        JOIN users u ON u.id = r.user_id
        JOIN stores s ON s.id = r.store_id
        WHERE s.owner_id = ?
        ORDER BY ${col} ${dir}`,
        [req.user.id]
    );

    res.json({ stores, raters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;