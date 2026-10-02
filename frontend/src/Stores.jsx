import { api } from './api.js'; 
import { DataTable } from './components.jsx'; 
 
function Stars({ value, onPick, onClear }) { 
    return ( 
        <span className="stars"> 
        {[1, 2, 3, 4, 5].map(n => ( 
            <button 
            key={n} 
            className={'star' + (n <= (value || 0) ? ' on' : '')} 
            aria-label={`${n} stars`} 
            onClick={() => onPick(n)} 
            >★</button> 
        ))} 
        {value && <button className="link" onClick={onClear}>Clear</button>} 
        </span> 
    ); 
} 

export default function Stores() { 
    return ( 
        <> 
        <div className="store-overview-head"> 
            <h2>Store Directory</h2> 
            <p>Find stores, check ratings, and share your experience.</p> 
        </div> 
 
        <DataTable 
            path="/stores" 
            filters={['name', 'address']} 
            columns={[ 
                { key: 'name', label: 'Store' }, 
                { key: 'address', label: 'Address' }, 
                { key: 'rating', label: 'Overall rating' }, 
                { key: 'my_rating', label: 'Your rating', render: r => r.my_rating ?? 'Not rated' }, 
            ]} 
 
            extra={(r, reload) => ( 
                <Stars 
                value={r.my_rating} 
                onPick={n => 
                    api(`/stores/${r.id}/rating`, { method: 'PUT', body: { rating: n } }) 
                    .then(reload) 
                    .catch(e => alert(e.message)) 
                } 
                onClear={() => 
                    api(`/stores/${r.id}/rating`, { method: 'DELETE' }) 
                    .then(reload) 
                    .catch(e => alert(e.message)) 
                } 
                /> 
            )} 
        /> 
        </> 
    ); 
}