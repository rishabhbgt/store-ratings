const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Please log in again'
        });
    }

    const token = header.slice(7);

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            message: 'Please log in again'
        });
    }
};

const allow = (...roles) => (req, res, next) =>
    roles.includes(req.user.role)
        ? next()
        : res.status(403).json({ message: 'Not allowed' });

module.exports = { auth, allow };