import { useState, useEffect } from 'react'; 
import { api } from './api.js'; 
import { Form, DataTable } from './components.jsx'; 
 
const TABS = ['Dashboard', 'Users', 'Stores', 'Add user', 'Add store']; 
 
export default function Admin({ tab, setTab }) { 
    const [stats, setStats] = useState({}); 
    const [detail, setDetail] = useState(null); 
    const [k, setK] = useState(0); 
    const [note, setNote] = useState(''); 
 
    useEffect(() => { api('/admin/stats').then(setStats); }, [k]); 
 
    useEffect(() => { setNote(''); setDetail(null); }, [tab]); 
 
    const add = (path, text) => async body => { 
        await api(path, { method: 'POST', body }); 
        setK(k => k + 1); 
        setNote(text); 
    }; 

    return ( 
        <> 
        <nav className="tabs mobile-tabs"> 
            {TABS.map(t => ( 
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button> 
            ))} 
        </nav> 

        {tab === 'Dashboard' && ( 
            <section className="admin-dashboard"> 
                <div className="stats"> 
                    <div> 
                        <span className="stat-label">Total Users</span> 
                        <b>{stats.users ?? '–'}</b> 
                    </div> 
                    <div> 
                        <span className="stat-label">Total Stores</span> 
                        <b>{stats.stores ?? '–'}</b> 
                    </div> 
                    <div> 
                        <span className="stat-label">Total Ratings</span> 
                        <b>{stats.ratings ?? '–'}</b> 
                    </div> 
                </div> 
 
                <div className="rating-overview"> 
                    <div className="rating-summary"> 
                        <p>Average Rating</p> 
                        <strong> 
                            {stats.averageRating || '0.0'} <span>★</span> 
                        </strong> 
                        <small>Overall store rating</small> 
                    </div> 
 
                    <div className="rating-breakdown"> 
                        <h2>Rating Overview</h2> 
 
                        {[5, 4, 3, 2, 1].map(rating => { 
                            const item = stats.ratingDistribution?.find( 
                                item => Number(item.rating) === rating 
                            ); 
 
                            const count = Number(item?.count || 0); 
 
                            const percentage = stats.ratings 
                                ? (count / Number(stats.ratings)) * 100 
                                : 0; 
 
                            return ( 
                                <div className="rating-row" key={rating}> 
                                    <span>{rating} ★</span> 
 
                                    <div className="rating-bar"> 
                                        <div style={{ width: `${percentage}%` }} /> 
                                    </div> 
 
                                    <b>{count}</b> 
                                </div> 
                            ); 
                        })} 
                    </div> 
                </div> 
            </section> 
        )} 
 
        {tab === 'Users' && ( 
            <section className="admin-section"> 
                <div className="admin-table-card"> 
                    <DataTable 
                        path="/admin/users" 
                        reloadKey={k} 
                        filters={[ 
                            'name', 'email', 'address', 
                            { key: 'role', placeholder: 'All roles', options: [ 
                                { value: 'USER', label: 'Normal user' }, 
                                { value: 'ADMIN', label: 'Admin' }, 
                                { value: 'OWNER', label: 'Store owner' }, 
                            ] }, 
                        ]} 
                        columns={[ 
                            { key: 'name', label: 'Name' }, 
                            { key: 'email', label: 'Email' }, 
                            { key: 'address', label: 'Address' }, 
                            { key: 'role', label: 'Role', render: r => <span className={`badge ${r.role}`}>{r.role}</span> }, 
                        ]} 
                        onRow={r => api('/admin/users/' + r.id).then(setDetail)} 
                    /> 
                </div> 
 
                {detail && ( 
                    <aside className="detail"> 
                        <h3>{detail.name}</h3> 
                        <p>{detail.email}</p> 
                        <p>{detail.address}</p> 
                        <p>Role: {detail.role}</p> 
                        {detail.role === 'OWNER' && <p>Store rating: {detail.rating ?? 'No ratings yet'}</p>} 
                        <button className="link" onClick={() => setDetail(null)}>Close</button> 
                    </aside> 
                )} 
            </section> 
        )} 
 
        {tab === 'Stores' && ( 
            <section className="admin-section"> 
                <div className="admin-table-card"> 
                    <DataTable 
                        path="/admin/stores" 
                        reloadKey={k} 
                        filters={['name', 'email', 'address']} 
                        columns={[ 
                            { key: 'name', label: 'Name' }, 
                            { key: 'email', label: 'Email' }, 
                            { key: 'address', label: 'Address' }, 
                            { key: 'rating', label: 'Rating' }, 
                        ]} 
                    /> 
                </div> 
            </section> 
        )} 
 
        {tab === 'Add user' && ( 
            <section className="admin-section"> 
                <div className="admin-form-head">
                    <h2>Create User Account</h2>
                    <p>Add a new user to the Store Ratings platform.</p>
                </div>
 
                <div className="admin-form-card"> 
                    {note && <p className="ok">{note}</p>} 
                    <Form 
                        submitLabel="Add user" 
                        initial={{ role: 'USER' }} 
                        fields={[ 
                            { name: 'name', label: 'Full name (20-60 characters)', rule: 'name' }, 
                            { name: 'email', label: 'Email', rule: 'email' }, 
                            { name: 'address', label: 'Address', rule: 'address', long: true }, 
                            { name: 'password', label: 'Password', type: 'password', rule: 'password' }, 
                            { name: 'role', label: 'Role', options: ['USER', 'ADMIN', 'OWNER'] }, 
                        ]} 
                        onSubmit={add('/admin/users', 'User added')} 
                    /> 
                </div> 
            </section> 
        )} 
 
        {tab === 'Add store' && ( 
            <section className="admin-section"> 
                <div className="admin-form-head">
                    <h2>Register New Store</h2>
                    <p>Add a store to the Store Ratings platform.</p>
                </div>
 
                <div className="admin-form-card"> 
                    {note && <p className="ok">{note}</p>} 
                    <Form 
                        submitLabel="Add store" 
                        fields={[ 
                            { name: 'name', label: 'Store name (20-60 characters)', rule: 'name' }, 
                            { name: 'email', label: 'Email', rule: 'email' }, 
                            { name: 'address', label: 'Address', rule: 'address', long: true }, 
                            { name: 'ownerEmail', label: 'Owner email (optional, must be a Store Owner)' }, 
                        ]} 
                        onSubmit={add('/admin/stores', 'Store added')} 
                    /> 
                </div> 
            </section> 
        )} 
        </> 
    ); 
}