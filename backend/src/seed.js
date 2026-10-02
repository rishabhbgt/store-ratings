const bcrypt = require('bcryptjs');
const db = require('./db');

(async () => {
    const hash = await bcrypt.hash('Admin@123', 10);
    await db.query(
    `INSERT IGNORE INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, 'ADMIN')`,
    ['System Administrator Account', 'admin@example.com', hash, 'Head office']
    );
    console.log('Admin ready: admin@example.com / Admin@123');
    process.exit(0);
})();