const router = require('express').Router();
const db = require('../db');
const { auth, allow } = require('../middleware/auth');
const { orderBy, buildFilters } = require('../utils/query');

router.use(auth, allow('USER'));

router.get('/', async (req, res) => {
    try {
        const f = buildFilters(req.query, { name: 's.name', address: 's.address' });
        const [rows] = await db.query(
        `SELECT s.id, s.name, s.address,
                ROUND(AVG(r.rating), 1) AS rating,
                MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS my_rating
        FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
        ${f.where} GROUP BY s.id
        ${orderBy(req.query, ['name', 'address', 'rating'], 'name')}`,
        [req.user.id, ...f.params]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.put('/:id/rating', async (req, res) => {
    try {
        const rating = Number(req.body.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

    await db.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
        [req.user.id, req.params.id, rating]
    );
        res.json({ message: 'Rating saved' });
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).json({ message: 'Store not found' });
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

    router.delete('/:id/rating', async (req, res) => {
    try {

        const [result] = await db.query(
        'DELETE FROM ratings WHERE user_id = ? AND store_id = ?',
        [req.user.id, req.params.id]
        );
        if (!result.affectedRows) return res.status(404).json({ message: 'No rating to remove' });
        res.json({ message: 'Rating removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;