const router = require('express').Router(); 
const bcrypt = require('bcryptjs'); 
const db = require('../db'); 
const { auth, allow } = require('../middleware/auth'); 
const { validate } = require('../validators'); 
const { orderBy, buildFilters } = require('../utils/query'); 

router.use(auth, allow('ADMIN')); 

const fail = (res, err) => { 
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' }); 
    console.error(err); 
    res.status(500).json({ message: 'Something went wrong' }); 
}; 

router.get('/stats', async (req, res) => { 
    try { 
        const [rows] = await db.query( 
        `SELECT (SELECT COUNT(*) FROM users) AS users, 
                (SELECT COUNT(*) FROM stores) AS stores, 
                (SELECT COUNT(*) FROM ratings) AS ratings, 
                (SELECT ROUND(AVG(rating), 1) FROM ratings) AS averageRating` 
        ); 

        const [distribution] = await db.query( 
                `SELECT rating, COUNT(*) AS count 
                FROM ratings 
                GROUP BY rating 
                ORDER BY rating DESC` 
        ); 

        res.json({ 
            ...rows[0], 
            averageRating: Number(rows[0].averageRating || 0).toFixed(1), 
            ratingDistribution: distribution 
        }); 
    } catch (err) { fail(res, err); } 
}); 

router.post('/users', async (req, res) => { 
    try { 
        const errors = validate(req.body, ['name', 'email', 'address', 'password', 'role']); 
        if (errors.length) return res.status(400).json({ message: errors[0], errors }); 

        const { name, email, address, password, role } = req.body; 
        const hash = await bcrypt.hash(password, 10); 
        const [result] = await db.query( 
        'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)', 
        [name, email.toLowerCase(), hash, address, role] 
    ); 
        res.status(201).json({ id: result.insertId, name, email: email.toLowerCase(), role }); 
    }  catch (err) { fail(res, err); } 
}); 

router.post('/stores', async (req, res) => { 
    try { 
        const errors = validate(req.body, ['name', 'email', 'address']); 
        const { name, email, address, ownerEmail } = req.body; 
        if (errors.length) return res.status(400).json({ message: errors[0], errors }); 

        let ownerId = null; 
        if (ownerEmail) { 
        const [owners] = await db.query("SELECT id FROM users WHERE email = ? AND role = 'OWNER'", [ownerEmail.toLowerCase()]); 
        if (!owners[0]) return res.status(400).json({ message: 'No store owner found with that email' }); 
        ownerId = owners[0].id; 
    } 

    const [result] = await db.query( 
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', 
        [name, email.toLowerCase(), address, ownerId] 
        ); 
        res.status(201).json({ id: result.insertId, name, email: email.toLowerCase(), address }); 
    } catch (err) { fail(res, err); } 
}); 

router.get('/users', async (req, res) => { 
    try { 
        const f = buildFilters(req.query, { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' }, ['role']); 
        const [rows] = await db.query( 
        `SELECT u.id, u.name, u.email, u.address, u.role FROM users u ${f.where} 
        ${orderBy(req.query, ['name', 'email', 'address', 'role'], 'name')}`, 
        f.params 
        ); 
        res.json(rows); 
    } catch (err) { fail(res, err); } 
}); 

router.get('/users/:id', async (req, res) => { 
    try { 
        const [rows] = await db.query( 
        `SELECT u.id, u.name, u.email, u.address, u.role, 
            (SELECT ROUND(AVG(r.rating), 1) FROM ratings r JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id) AS rating 
        FROM users u WHERE u.id = ?`, 
        [req.params.id] 
        ); 
        if (!rows[0]) return res.status(404).json({ message: 'User not found' }); 
        if (rows[0].role !== 'OWNER') delete rows[0].rating; 
        res.json(rows[0]); 
    } catch (err) { fail(res, err); } 
}); 

router.get('/stores', async (req, res) => { 
    try { 
        const f = buildFilters(req.query, { name: 's.name', email: 's.email', address: 's.address' }); 
        const [rows] = await db.query( 
        `SELECT s.id, s.name, s.email, s.address, ROUND(AVG(r.rating), 1) AS rating 
        FROM stores s LEFT JOIN ratings r ON r.store_id = s.id 
        ${f.where} GROUP BY s.id 
        ${orderBy(req.query, ['name', 'email', 'address', 'rating'], 'name')}`, 
        f.params 
        ); 
        res.json(rows); 
    } catch (err) { fail(res, err); } 
}); 
module.exports = router;