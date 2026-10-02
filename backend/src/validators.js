const rules = {
    name: v =>
        (typeof v === 'string' &&
            v.trim().length >= 20 &&
            v.trim().length <= 60) ||
        'Name must be 20-60 characters',

    email: v =>
        (typeof v === 'string' &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) &&
            v.trim().length <= 255) ||
        'Enter a valid email',

    address: v =>
        (typeof v === 'string' &&
            v.trim().length >= 1 &&
            v.trim().length <= 400) ||
        'Address is required (max 400 characters)',

    password: v =>
        (typeof v === 'string' &&
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(v)) ||
        'Password must be 8-16 characters with one uppercase letter and one special character',

    role: v =>
        ['ADMIN', 'USER', 'OWNER'].includes(v) ||
        'Invalid role',
};

const validate = (body, fields) =>
    fields
        .map(f => rules[f](body[f]))
        .filter(result => result !== true);

module.exports = { validate };