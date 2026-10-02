const orderBy = (q, allowed, def) => {
    const col = allowed.includes(q.sort) ? q.sort : def;
    const expr = col === 'rating' ? 'AVG(r.rating)' : col;
    const dir = q.order === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY ${expr} IS NULL, ${expr} ${dir}`;
};

const buildFilters = (q, map, exact = []) => {
    const conditions = [];
    const params = [];
    for (const [key, col] of Object.entries(map)) {
        if (!q[key]) continue;
        if (exact.includes(key)) {
        conditions.push(`${col} = ?`);
        params.push(String(q[key]).toUpperCase());
        } else {
            conditions.push(`${col} LIKE ?`);
            params.push(`%${q[key]}%`);
        }
    }
    return { where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '', params };
};

module.exports = { orderBy, buildFilters };