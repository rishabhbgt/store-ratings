import { useState, useEffect } from 'react';
import { api } from './api.js';

const COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'rating', label: 'Rating' },
];

export default function Owner() {
    const [data, setData] = useState({ stores: [], raters: [] });
    const [sort, setSort] = useState('name');
    const [order, setOrder] = useState('asc');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/owner/dashboard', { params: { sort, order } })
        .then(setData)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }, [sort, order]);

    const toggle = key => {
        if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc');
        else { setSort(key); setOrder('asc'); }
    };

    if (error) return <p className="err">{error}</p>;
    if (loading) return <p>Loading…</p>;

    if (!data.stores.length) {
        return <p>No store is linked to your account yet. Ask the admin to assign one.</p>;
    }

    const multi = data.stores.length > 1; 

    return (
        <>
        <div className="owner-overview-head"> 
            <h2>Store Overview</h2> 
            <p>Performance and customer ratings for your store.</p> 
        </div> 
    
        <div className="stats"> 
            {data.stores.map(s => ( 
            <div key={s.id}> 
                <b>{s.average ?? '–'}</b> 
                {s.name} average ({s.total_ratings} {s.total_ratings === 1 ? 'rating' : 'ratings'}) 
            </div> 
            ))} 
        </div> 

        <h2 className="section-title">People who rated your store</h2>

        <div className="toolbar">
            <div className="sort-mobile always">
            <select value={sort} onChange={e => { setSort(e.target.value); setOrder('asc'); }}>
                {COLUMNS.map(c => <option key={c.key} value={c.key}>Sort by {c.label}</option>)}
            </select>
            <button className="ghost order-btn" onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
                {order === 'asc' ? '▲ Ascending' : '▼ Descending'}
            </button>
            </div>
        </div>

        <div className="scroll">
            <table>
            <thead>
                <tr>
                {COLUMNS.map(c => (
                    <th key={c.key}>
                    <button className="link" onClick={() => toggle(c.key)}>
                        {c.label}{sort === c.key ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                    </th>
                ))}
                {multi && <th>Store</th>}
                </tr>
            </thead>
            <tbody>
                {data.raters.map(r => (
                <tr key={`${r.id}-${r.store}`}>
                    <td data-label="Name">{r.name}</td>
                    <td data-label="Email">{r.email}</td>
                    <td data-label="Rating"><span className="score">★ {r.rating}</span></td>
                    {multi && <td data-label="Store">{r.store}</td>}
                </tr>
                ))}
                {!data.raters.length && (
                <tr><td className="empty" colSpan={multi ? 4 : 3}>No ratings yet.</td></tr>
                )}
            </tbody>
            </table>
        </div>
        </>
    );
}