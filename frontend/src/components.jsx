import { useState, useEffect, useCallback } from 'react';
import { api, rules } from './api.js';

export function Form({ fields, submitLabel, onSubmit, initial = {} }) {
    const [v, setV] = useState(initial);
    const [errs, setErrs] = useState({});
    const [msg, setMsg] = useState(null);
    const [show, setShow] = useState({});   
    const [busy, setBusy] = useState(false);

    const set = (name, value) => setV({ ...v, [name]: value });

    const submit = async e => {
        e.preventDefault();
        setMsg(null);
        const found = {};
        fields.forEach(f => {
        if (!f.rule) return;
        const r = rules[f.rule](v[f.name] || '');
        if (r !== true) found[f.name] = r;
        });
        setErrs(found);
        if (Object.keys(found).length) return;

        setBusy(true);
        try {
        await onSubmit(v);
        setV(initial);
        } catch (er) {
        setMsg(er.message);
        } finally {
        setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate>
        {fields.map(f => (
            <label key={f.name}>{f.label}
            {f.options ? (
                <select value={v[f.name] || ''} onChange={e => set(f.name, e.target.value)}>
                <option value="">Select…</option>
                {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
            ) : f.long ? (
                <textarea rows="2" placeholder={f.placeholder} autoComplete={f.auto}
                value={v[f.name] || ''} onChange={e => set(f.name, e.target.value)} />
            ) : f.type === 'password' ? (
                <div className="field pw">
                <input type={show[f.name] ? 'text' : 'password'} placeholder={f.placeholder} autoComplete={f.auto}
                    value={v[f.name] || ''} onChange={e => set(f.name, e.target.value)} />
                <button type="button" className="eye"
                    aria-label={show[f.name] ? 'Hide password' : 'Show password'}
                    onClick={() => setShow({ ...show, [f.name]: !show[f.name] })}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                    {show[f.name] ? (
                        <><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.7 6.7A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4.3-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>
                    ) : (
                        <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>
                    )}
                    </svg>
                </button>
                </div>
            ) : (
                <input type={f.type || 'text'} placeholder={f.placeholder} autoComplete={f.auto}
                value={v[f.name] || ''} onChange={e => set(f.name, e.target.value)} />
            )}
            {f.hint && !errs[f.name] && <span className="hint">{f.hint}</span>}
            {errs[f.name] && <span className="err">{errs[f.name]}</span>}
            </label>
        ))}
        <button type="submit" className="primary" disabled={busy}>{busy ? 'Please wait…' : submitLabel}</button>
        {msg && <p className="err">{msg}</p>}
        </form>
    );
}

export function DataTable({ path, columns, filters = [], extra, reloadKey, onRow }) {
    const [rows, setRows] = useState([]);
    const [f, setF] = useState({});
    const [sort, setSort] = useState('name');
    const [order, setOrder] = useState('asc');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(
        () => api(path, { params: { ...f, sort, order } })
        .then(setRows)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false)),
        [path, f, sort, order]
    );

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load, reloadKey]);

    const toggle = key => {
        if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc');
        else { setSort(key); setOrder('asc'); }
    };

    return (
        <div>
        <div className="toolbar">
            {filters.map(fl => {
            const k = typeof fl === 'string' ? fl : fl.key;
            if (fl.options) {
                return (
                <select key={k} aria-label={`Filter by ${k}`} value={f[k] || ''}
                    onChange={e => setF({ ...f, [k]: e.target.value })}>
                    <option value="">{fl.placeholder}</option>
                    {fl.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                );
            }
            return (
                <div className="search" key={k}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    aria-label={`Search by ${k}`}
                    placeholder={`Search by ${k}`}
                    onChange={e => setF({ ...f, [k]: e.target.value })}
                />
                </div>
            );
            })}

            <div className="sort-mobile">
            <select value={sort} onChange={e => { setSort(e.target.value); setOrder('asc'); }}>
                {columns.map(c => <option key={c.key} value={c.key}>Sort by {c.label}</option>)}
            </select>
            <button className="ghost" onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
                {order === 'asc' ? '▲ Ascending' : '▼ Descending'}
            </button>
            </div>
        </div>

        {error && <p className="err">{error}</p>}

        <div className="scroll">
            <table>
            <thead>
                <tr>
                {columns.map(c => (
                    <th key={c.key}>
                    <button className="link" onClick={() => toggle(c.key)}>
                        {c.label}{sort === c.key ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                    </th>
                ))}
                {extra && <th>Rate this store</th>}
                </tr>
            </thead>
            <tbody>
                {rows.map(r => (
                <tr key={r.id} className={onRow ? 'click' : ''} onClick={() => onRow?.(r)}>
                    {columns.map(c => (
                    <td key={c.key} data-label={c.label}>{c.render ? c.render(r) : r[c.key] ?? '–'}</td>
                    ))}
                    {extra && <td data-label="Rate this store">{extra(r, load)}</td>}
                </tr>
                ))}
                {!rows.length && (
                <tr><td className="empty" colSpan={columns.length + (extra ? 1 : 0)}>
                    {loading ? 'Loading…' : 'Nothing matches yet. Try a different search.'}
                </td></tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}

export function PasswordForm() {
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    return (
        <>
        {note && <p className="ok">{note}</p>}
        {error && <p className="err">{error}</p>}

        <Form
            submitLabel="Update password"
            fields={[
                { name: 'currentPassword', label: 'Current password', type: 'password' },
                { name: 'newPassword', label: 'New password', type: 'password', rule: 'password' },
                { name: 'confirmPassword', label: 'Confirm password', type: 'password', rule: 'password' },
            ]}
            onSubmit={async body => {
                setNote('');
                setError('');

                if (body.newPassword !== body.confirmPassword) {
                    setError('New passwords do not match');
                    return;
                }

                const { confirmPassword, ...passwordBody } = body;

                await api('/auth/password', {
                    method: 'PUT',
                    body: passwordBody
                });

                setNote('Password updated');
            }}
        />
        </>
    );
}